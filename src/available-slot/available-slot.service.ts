import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailableSlot } from '../entities/available-slot.entity';
import { CreateAvailableSlotDto } from './dto/create-available-slot.dto';
import { UpdateAvailableSlotDto } from './dto/update-available-slot.dto';
import { Doctor } from '../entities/doctor.entity';
import { Between } from 'typeorm';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { SlotMode } from './dto/update-available-slot.dto';
import { LessThan, MoreThan } from 'typeorm';

dayjs.extend(isSameOrBefore);

@Injectable()
export class AvailableSlotService {
  constructor(
    @InjectRepository(AvailableSlot)
    private slotRepository: Repository<AvailableSlot>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(doctorId: number, dto: CreateAvailableSlotDto) {
  try {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['user'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const dayName = dayjs(dto.date).format('dddd');
    const availability = doctor.availability?.[dayName];

    if (!availability || !availability.available) {
      throw new BadRequestException('Doctor not available on this date');
    }

    const timeRanges = availability.fullDay
      ? [
          { from: '09:00', to: '13:00' },
          { from: '14:00', to: '18:00' },
        ]
      : availability.slots || [];

    if (dto.mode === 'stream') {
      return await this.createStreamSlots(doctor, dto, timeRanges);
    }

    if (dto.mode === 'wave') {
      return await this.createWaveSlots(doctor, dto, timeRanges);
    }

    throw new BadRequestException('Unsupported mode provided');
  } catch (err) {
    throw new BadRequestException(err.message);
  }
}

private async createStreamSlots(
  doctor: Doctor,
  dto: CreateAvailableSlotDto,
  timeRanges: { from: string; to: string }[],
) {
  if (!dto.date || !dto.slotDuration || !dto.maxBookings) {
    throw new BadRequestException('Missing required fields for stream mode');
  }

  const createdSlots: AvailableSlot[] = [];

  for (const range of timeRanges) {
    let slotStart = dayjs(`${dto.date}T${range.from}`);
    const slotEndLimit = dayjs(`${dto.date}T${range.to}`);

    while (
      slotStart.add(dto.slotDuration, 'minute').isSameOrBefore(slotEndLimit)
    ) {
      const start = slotStart;
      const end = slotStart.add(dto.slotDuration, 'minute');

      const formattedStart = start.format('HH:mm');
      const formattedEnd = end.format('HH:mm');

      const isOverlap = await this.checkSlotOverlap(
        doctor.id,
        dto.date,
        formattedStart,
        formattedEnd,
      );

      if (!isOverlap) {
        const slot = this.slotRepository.create({
          doctor,
          date: dto.date,
          startTime: formattedStart,
          endTime: formattedEnd,
          mode: 'stream',
          slotDuration: dto.slotDuration,
          maxBookings: dto.maxBookings,
        });

        const saved = await this.slotRepository.save(slot);
        createdSlots.push(saved);
      }

      slotStart = end;
    }
  }

 return {
  message: createdSlots.length
    ? 'Stream slots created successfully'
    : 'No new Stream slots created. All overlapped.',
  count: createdSlots.length,
  slots: createdSlots.map((slot) => ({
    id: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    mode: slot.mode,
    maxBookings: slot.maxBookings,
    slotDuration: slot.slotDuration,
    groupSize: slot.groupSize,
    emergency: slot.emergency,
    doctorId: doctor.id,
    doctorName: doctor.user.name,
  })),
};
}

  //Wave method here

private async createWaveSlots(
  doctor: Doctor,
  dto: CreateAvailableSlotDto,
  timeRanges: { from: string; to: string }[],
) {
  if (
    !dto.date ||
    !dto.slotDuration ||
    !dto.waveGap ||
    !dto.groupSize ||
    !dto.maxBookings
  ) {
    throw new BadRequestException('Missing required fields for wave mode');
  }

  const createdSlots: AvailableSlot[] = [];

  for (const range of timeRanges) {
    let waveStart = dayjs(`${dto.date}T${range.from}`);
    const waveEndLimit = dayjs(`${dto.date}T${range.to}`);

    while (
      waveStart.add(dto.slotDuration, 'minute').isSameOrBefore(waveEndLimit)
    ) {
      const start = waveStart;
      const end = waveStart.add(dto.slotDuration, 'minute');

      const formattedStart = start.format('HH:mm');
      const formattedEnd = end.format('HH:mm');

      // Create `groupSize` number of slots with same start-end time
      for (let i = 0; i < dto.groupSize; i++) {
      const isOverlap = await this.checkSlotOverlap(
      doctor.id,
      dto.date,
      formattedStart,
      formattedEnd,
    );

    if (!isOverlap) {
      for (let i = 0; i < dto.groupSize; i++) {
        const slot = this.slotRepository.create({
          doctor,
          date: dto.date,
          startTime: formattedStart,
          endTime: formattedEnd,
          mode: 'wave',
          slotDuration: dto.slotDuration,
          maxBookings: dto.maxBookings,
          groupSize: dto.groupSize,
        });

        const saved = await this.slotRepository.save(slot);
        createdSlots.push(saved);
      }
    }

      }

      // Move to next wave start
      waveStart = waveStart.add(dto.slotDuration + dto.waveGap, 'minute');
    }
  }

  return {
    message: createdSlots.length
      ? 'Wave slots created successfully'
      : 'No new wave slots created. All overlapped.',
    count: createdSlots.length,
    slots: createdSlots.map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      mode: slot.mode,
      maxBookings: slot.maxBookings,
      slotDuration: slot.slotDuration,
      groupSize: slot.groupSize,
      emergency: slot.emergency,
      doctorId: doctor.id,
      doctorName: doctor.user.name,
    })),
  };
}

  private async checkSlotOverlap(
    doctorId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    return !!(await this.slotRepository.findOne({
      where: {
        doctor: { id: doctorId },
        date: new Date(date),
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    }));
  }

  async findByDoctor(doctorId: number) {
    try {
      const slots = await this.slotRepository.find({
        where: { doctor: { id: doctorId } },
        order: { date: 'ASC', startTime: 'ASC' },
      });

      return slots.map((slot) => ({
        slotId: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        mode: slot.mode,
        maxBookings: slot.maxBookings,
      }));
    } catch (err) {
      throw new BadRequestException('Error fetching slots');
    }
  }

  //Update the slot

  async update(id: number, updateDto: UpdateAvailableSlotDto) {
    const slot = await this.slotRepository.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');

    Object.assign(slot, updateDto);

    const date = updateDto.date || slot.date;
    const startTime = updateDto.startTime || slot.startTime;
    const slotDuration = updateDto.slotDuration || slot.slotDuration;
    const mode = updateDto.mode || slot.mode;

    let endTime: string;

    if (mode === SlotMode.STREAM) {
      endTime = dayjs(`${date}T${startTime}`)
        .add(slotDuration, 'minute')
        .format('HH:mm');
      slot.endTime = endTime;
    } else if (mode === SlotMode.WAVE) {
      if (!updateDto.endTime) {
        throw new BadRequestException('End time is required for WAVE mode');
      }
      endTime = updateDto.endTime;
      slot.endTime = endTime;
    } else {
      throw new BadRequestException('Invalid slot mode');
    }

    // Overlap check
    const overlappingSlots = await this.slotRepository
      .createQueryBuilder('s')
      .where('s.date = :date', { date })
      .andWhere('s.id != :id', { id })
      .andWhere('(s.startTime < :endTime AND s.endTime > :startTime)', {
        startTime,
        endTime,
      })
      .getMany();

    if (overlappingSlots.length > 0) {
      throw new BadRequestException('Slot overlaps with existing slots');
    }

    await this.slotRepository.save(slot);

    return this.slotRepository.findOne({ where: { id } });
  }

  async delete(slotId: number, doctorId: number) {
    try {
      const slot = await this.slotRepository.findOne({
        where: { id: slotId, doctor: { id: doctorId } },
      });

      if (!slot) throw new NotFoundException('Slot not found');

      await this.slotRepository.remove(slot);
      return { message: 'Slot deleted successfully', slotId };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}