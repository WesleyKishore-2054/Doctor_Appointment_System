import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Request } from 'express';
import dayjs from 'dayjs';
import { AvailableSlot } from '../entities/available-slot.entity';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);


interface ShiftResult {
  success: boolean;
  message: string;
  shiftedAppointments: number;
  overflowAppointments: Appointment[];
  totalDelayDistributed: number;
}

interface WorkingHours {
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

@Injectable()
export class AppointmentService {
  // Configuration constants
  private readonly DAMPING_FACTOR = 0.75; // Each appointment absorbs 25% of remaining delay
  private readonly MIN_SHIFT_THRESHOLD = 2; // Minimum minutes to shift
  private readonly BUFFER_TIME = 5; // Buffer minutes between appointments
  private readonly MAX_SINGLE_SHIFT = 45; // Maximum minutes any single appointment can be shifted

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(AvailableSlot)
    private readonly slotRepo: Repository<AvailableSlot>
  ) {}

 async create(patientUserId: number, doctorUserId: number, dto: CreateAppointmentDto) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { id: doctorUserId },
        relations: ['user'],
      });
      if (!doctor) throw new NotFoundException('Doctor not found');

      const patient = await this.patientRepo.findOne({
        where: { user: { id: patientUserId } },
        relations: ['user'],
      });
      if (!patient) throw new NotFoundException('Patient not found');

      const slot = await this.slotRepo.findOne({
        where: { id: dto.slotId },
        relations: ['doctor', 'doctor.user'],
      });
      if (!slot) throw new NotFoundException('Slot not found');

      // Check if slot is already booked
      const existingAppointment = await this.appointmentRepo.findOne({
        where: { slot: { id: slot.id } },
      });

      if (existingAppointment) {
        const allSlots = await this.slotRepo.find({
          where: { doctor: { id: doctorUserId }, date: slot.date },
          order: { startTime: 'ASC' },
        });

        const bookedSlotIds = await this.appointmentRepo
          .createQueryBuilder('appointment')
          .select('appointment.slotId')
          .where('appointment.doctorId = :doctorId', { doctorId: doctorUserId })
          .andWhere('appointment.appointmentDate = :date', { date: slot.date })
          .getRawMany();

        const bookedIds = bookedSlotIds.map((row) => row.appointment_slotId);
        const availableSlots = allSlots.filter((s) => !bookedIds.includes(s.id));

        throw new BadRequestException({
          message: 'Slot already booked. Please choose a different time.',
          availableSlots,
        });
      }

      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight

      if (slotDate < today) {
        throw new BadRequestException({
          message: 'Cannot book a slot for a past date.',
          suggestion: 'Please choose today or a future date.',
        });
      }

      const workingHours = await this.getDoctorWorkingHours(doctorUserId, new Date(slot.date));
       const day = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' });


      if (slot.startTime < workingHours.startTime || slot.endTime > workingHours.endTime) {
        throw new BadRequestException('Selected slot is outside doctor working hours.');
      }

      const appointment = this.appointmentRepo.create({
        doctor,
        patient,
        slot,
        appointmentDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'booked',
        isRescheduled: false,
        rescheduleRequired: false,
        day,
      });

      const saved = await this.appointmentRepo.save(appointment);
      return {
        message: 'Appointment created successfully',
        data: saved,
      };
    } catch (err) {
      throw new BadRequestException(err.message || 'Failed to create appointment');
    }
  }

  /**
   * Get doctor's working hours for a specific date
   */
  private async getDoctorWorkingHours(doctorId: number, date: Date): Promise<WorkingHours> {
    // Get the first and last available slots for the day to determine working hours
    const daySlots = await this.slotRepo.find({
      where: { doctor: { id: doctorId }, date },
      order: { startTime: 'ASC' },
    });

    if (!daySlots.length) {
      throw new BadRequestException('No working hours found for this doctor on the specified date');
    }

    return {
      startTime: daySlots[0].startTime,
      endTime: daySlots[daySlots.length - 1].endTime,
      // You can extend this to include break times from doctor entity if available
    };
  }

  /**
   * Smart delta distribution with boundary checks
   */
  private async smartDelayDistribution(
    remainingAppointments: Appointment[],
    deltaMinutes: number,
    workingHours: WorkingHours,
    appointmentDate: Date
  ): Promise<ShiftResult> {
    console.log('Delta minutes in smartDelayDistribution:', deltaMinutes);
  console.log('Math.abs(deltaMinutes):', Math.abs(deltaMinutes));
  console.log('MIN_SHIFT_THRESHOLD:', this.MIN_SHIFT_THRESHOLD);
    if (Math.abs(deltaMinutes) <= this.MIN_SHIFT_THRESHOLD) {
      return {
        success: true,
        message: 'Delay too small to require shifting',
        shiftedAppointments: 0,
        overflowAppointments: [],
        totalDelayDistributed: 0
      };
    }

    const shiftedAppointments: Appointment[] = [];
    const overflowAppointments: Appointment[] = [];
    let remainingDelay = deltaMinutes;
    let totalDistributed = 0;

    const workingEndTime = dayjs(`${appointmentDate}.T${workingHours.endTime}`);

    for (let i = 0; i < remainingAppointments.length; i++) {
      const appointment = remainingAppointments[i];
      
      // Calculate shift amount with damping
      const dampingMultiplier = Math.pow(this.DAMPING_FACTOR, i);
      let shiftAmount = Math.min(
        Math.ceil(Math.abs(remainingDelay) * dampingMultiplier),
        this.MAX_SINGLE_SHIFT,
        Math.abs(remainingDelay)
      );
      // But apply the original sign  
      shiftAmount = remainingDelay < 0 ? -shiftAmount : shiftAmount;

      if (Math.abs(shiftAmount) < this.MIN_SHIFT_THRESHOLD) {
        break;
      }

      const currentStart = dayjs(`${appointmentDate}T${appointment.startTime}`);
      const currentEnd = dayjs(`${appointmentDate}T${appointment.endTime}`);
      
      const newStart = currentStart.add(shiftAmount, 'minute');
      const newEnd = currentEnd.add(shiftAmount, 'minute');

      // Boundary check - does it exceed working hours?
      if (newEnd.isAfter(workingEndTime)) {
        // Calculate how much we can shift without exceeding working hours
        const maxPossibleShift = workingEndTime.diff(currentEnd, 'minute');
        
        if (maxPossibleShift > this.MIN_SHIFT_THRESHOLD) {
          // Partial shift
          shiftAmount = maxPossibleShift;
          appointment.startTime = currentStart.add(shiftAmount, 'minute').format('HH:mm');
          appointment.endTime = currentEnd.add(shiftAmount, 'minute').format('HH:mm');
          shiftedAppointments.push(appointment);
          totalDistributed += shiftAmount;
          remainingDelay -= shiftAmount;
        }

        // Add remaining appointments to overflow
        overflowAppointments.push(...remainingAppointments.slice(i + (maxPossibleShift > this.MIN_SHIFT_THRESHOLD ? 1 : 0)));
        break;
      }

      // Apply the shift
      appointment.startTime = newStart.format('HH:mm');
      appointment.endTime = newEnd.format('HH:mm');
      shiftedAppointments.push(appointment);
      
      totalDistributed += shiftAmount;
      remainingDelay -= shiftAmount;

      if (remainingDelay <= this.MIN_SHIFT_THRESHOLD) {
        break;
      }
    }

    return {
      success: overflowAppointments.length === 0,
      message: this.generateShiftMessage(shiftedAppointments.length, overflowAppointments.length, totalDistributed),
      shiftedAppointments: shiftedAppointments.length,
      overflowAppointments,
      totalDelayDistributed: totalDistributed
    };
  }

   private generateShiftMessage(shifted: number, overflow: number, totalDelay: number): string {
    let message = `Appointment completed. `;
    
    if (shifted > 0) {
      message += `${shifted} appointment(s) shifted by total of ${totalDelay} minutes. `;
    }
    
    if (overflow > 0) {
      message += `${overflow} appointment(s) exceed working hours and require rescheduling.`;
    } else if (shifted === 0) {
      message += `No appointments needed to be shifted.`;
    }
    
    return message.trim();
  }

  /**
   * Enhanced mark as completed with smart scheduling
   */
  async markAsCompleted(appointmentId: number, actualStartTime: string, actualEndTime: string) {
  return await this.appointmentRepo.manager.transaction(async manager => {
    const appointment = await manager.findOne(Appointment, {
      where: { id: appointmentId },
      relations: ['doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'completed') {
      throw new BadRequestException('Appointment already completed');
    }

    // Update appointment status
    appointment.actualStartTime = actualStartTime;
    appointment.actualEndTime = actualEndTime;
    appointment.status = 'completed';

    const plannedEnd = dayjs(`${appointment.appointmentDate}T${appointment.endTime}`);
    const actualEnd = dayjs(`${appointment.appointmentDate}T${actualEndTime}`);
    const deltaMinutes = actualEnd.diff(plannedEnd, 'minute');

    await manager.save(Appointment, appointment);

    if (Math.abs(deltaMinutes) <= this.MIN_SHIFT_THRESHOLD) {
      return { 
        message: 'Appointment completed. No significant time shift detected.',
        shiftResult: null
      };
    }

    // Get remaining appointments for the day
    const allRemainingAppointments = await manager.find(Appointment, {
      where: {
        doctor: { id: appointment.doctor.id },
        appointmentDate: appointment.appointmentDate,
        status: 'booked',
      },
      order: { startTime: 'ASC' },
    });

    console.log('Delta minutes:', deltaMinutes);
    console.log('Planned end time:', appointment.endTime);
    console.log('Actual end time:', actualEndTime);
    console.log('All remaining appointments:', allRemainingAppointments.length);

    // Get all remaining appointments that need to be processed
    let remainingAppointments;
    
    if (deltaMinutes > 0) {
      // POSITIVE DIFFERENCE (OVERTIME): Get all appointments starting at or after planned end
      remainingAppointments = allRemainingAppointments.filter(apt => {
        const aptStartTime = dayjs(`${appointment.appointmentDate}T${apt.startTime}`);
        const plannedEndDateTime = dayjs(`${appointment.appointmentDate}T${appointment.endTime}`);
        return aptStartTime.isSameOrAfter(plannedEndDateTime);
      });
    } else if (deltaMinutes < 0) {
      // NEGATIVE DIFFERENCE (UNDERTIME): Get all appointments starting after actual end
      const actualEndDateTime = dayjs(`${appointment.appointmentDate}T${actualEndTime}`);
      remainingAppointments = allRemainingAppointments.filter(apt => {
        const aptStartTime = dayjs(`${appointment.appointmentDate}T${apt.startTime}`);
        return aptStartTime.isAfter(actualEndDateTime);
      });
    } else {
      remainingAppointments = [];
    }

    console.log('Filtered remaining appointments:', remainingAppointments.length);

    if (remainingAppointments.length === 0) {
      return { 
        message: 'Appointment completed. No remaining appointments to adjust.',
        shiftResult: null
      };
    }

    // CASCADING SHIFT LOGIC: Each appointment shifts based on the previous one's actual end
    let currentActualEndTime = actualEndTime;
    let totalShifted = 0;
    const shiftedAppointments: Appointment[] = []; // Fixed: Proper type annotation

    for (const apt of remainingAppointments) {
      const originalStartTime = dayjs(`${appointment.appointmentDate}T${apt.startTime}`);
      const originalEndTime = dayjs(`${appointment.appointmentDate}T${apt.endTime}`);
      const appointmentDuration = originalEndTime.diff(originalStartTime, 'minute');
      
      // Calculate new start time based on previous appointment's actual end + buffer
      const previousEndTime = dayjs(`${appointment.appointmentDate}T${currentActualEndTime}`);
      const newStartTime = previousEndTime.add(this.MIN_SHIFT_THRESHOLD, 'minute');
      const newEndTime = newStartTime.add(appointmentDuration, 'minute');
      
      // Check if it exceeds working hours
      const workingHours = await this.getDoctorWorkingHours(
        appointment.doctor.id, 
        appointment.appointmentDate
      );
      const workingEndTime = dayjs(`${appointment.appointmentDate}T${workingHours.endTime}`);
      
      if (newEndTime.isAfter(workingEndTime)) {
        // Mark as overflow - needs rescheduling
        apt.rescheduleRequired = true;
        apt.status = 'needs_reschedule';
        shiftedAppointments.push(apt);
        break; // Stop processing further appointments
      }
      
      // Apply the shift
      const oldStart = apt.startTime;
      const oldEnd = apt.endTime;
      
      apt.startTime = newStartTime.format('HH:mm:ss');
      apt.endTime = newEndTime.format('HH:mm:ss');
      
      console.log(`Shifted Appointment ${apt.id}: ${oldStart}-${oldEnd} → ${apt.startTime}-${apt.endTime}`);
      
      // Update currentActualEndTime for next iteration
      currentActualEndTime = apt.endTime;
      shiftedAppointments.push(apt);
      totalShifted++;
    }

    // Save all shifted appointments
    if (shiftedAppointments.length > 0) {
      await manager.save(Appointment, shiftedAppointments);
    }

    return {
      message: `Appointment completed. ${totalShifted} appointment(s) shifted successfully.`,
      shiftResult: {
        totalDelayMinutes: deltaMinutes,
        appointmentsShifted: totalShifted,
        delayDistributed: deltaMinutes,
        appointmentsNeedingReschedule: shiftedAppointments.filter(apt => apt.status === 'needs_reschedule').length,
        overflowAppointments: shiftedAppointments
          .filter(apt => apt.status === 'needs_reschedule')
          .map(apt => ({
            id: apt.id,
            originalTime: `${apt.startTime}-${apt.endTime}`,
            patientId: apt.patient?.id
          }))
      }
    };
  });
}

  async updateStatus(id: number, status: string, req: any) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['doctor', 'doctor.user', 'patient'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.doctor.user.id !== req.user.sub) {
      throw new BadRequestException('You are not authorized to update this appointment');
    }

    appointment.status = status;
    return await this.appointmentRepo.save(appointment);
  }

  async cancelAppointment(id: number, userId: number, role: 'doctor' | 'patient') {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (!userId || !role) {
      throw new BadRequestException('Invalid user details');
    }

    const isDoctor = role === 'doctor' && appointment.doctor?.user?.id === userId;
    const isPatient = role === 'patient' && appointment.patient?.user?.id === userId;
    if (!isDoctor && !isPatient) {
      throw new BadRequestException('User not authorized to cancel this appointment');
    }

    appointment.status = 'cancelled';
    appointment.rescheduleRequired = true;
    (appointment as any).cancelledBy = role;

    return await this.appointmentRepo.save(appointment);
  }

  async reschedule(id: number, newDate: Date, newStart: string, newEnd: string) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.originalDate = appointment.appointmentDate;
    appointment.originalStartTime = appointment.startTime;
    appointment.originalEndTime = appointment.endTime;
    appointment.appointmentDate = newDate;
    appointment.startTime = newStart;
    appointment.endTime = newEnd;
    appointment.isRescheduled = true;
    appointment.rescheduleRequired = false;

    return await this.appointmentRepo.save(appointment);
  }

  async getDoctorAppointments(doctorUserId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: doctorUserId } },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return await this.appointmentRepo.find({
      where: { doctor: { id: doctor.id } },
      relations: ['patient'],
    });
  }

  async getPatientAppointments(patientUserId: number) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: patientUserId } },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return await this.appointmentRepo.find({
      where: { patient: { id: patient.id } },
      relations: ['doctor'],
    });
  }

  /**
   * Get appointments that need rescheduling due to overflow
   */
  async getAppointmentsNeedingReschedule(doctorUserId: number, date?: Date) {
    const whereCondition: any = {
      doctor: { user: { id: doctorUserId } },
      rescheduleRequired: true,
      status: 'needs_reschedule'
    };

    if (date) {
      whereCondition.appointmentDate = date;
    }

    return await this.appointmentRepo.find({
      where: whereCondition,
      relations: ['patient', 'doctor'],
      order: { appointmentDate: 'ASC', startTime: 'ASC' }
    });
  }
}