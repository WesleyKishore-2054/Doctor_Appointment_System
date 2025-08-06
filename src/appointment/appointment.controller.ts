import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  ParseIntPipe,
  Patch,
  Get,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CompleteAppointmentDto} from './dto/complete-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('book/:doctorId')
  @ApiOperation({ summary: 'Book an appointment with a doctor' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  @ApiResponse({ status: 400, description: 'Slot already booked or validation error' })
  @HttpCode(HttpStatus.CREATED)
  async bookAppointment(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateAppointmentDto,
    @Req() req: any
  ) {
    return await this.appointmentService.create(req.user.sub, doctorId, dto);
  }

  @Patch(':id/cancel/patient')
  @ApiOperation({ summary: 'Cancel appointment by patient' })
  @HttpCode(HttpStatus.OK)
  async cancelByPatient(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return await this.appointmentService.cancelAppointment(id, userId, 'patient');
  }

  @Patch(':id/cancel/doctor')
  @ApiOperation({ summary: 'Cancel appointment by doctor' })
  @HttpCode(HttpStatus.OK)
  async cancelByDoctor(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return await this.appointmentService.cancelAppointment(id, userId, 'doctor');
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  @HttpCode(HttpStatus.OK)
  async reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto
  ) {
    return await this.appointmentService.reschedule(
      id,
      new Date(dto.newDate),
      dto.newStartTime,
      dto.newEndTime
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: Request
  ) {
    return await this.appointmentService.updateStatus(id, dto.status, req);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark appointment as completed with actual times' })
  @ApiResponse({ 
    status: 200, 
    description: 'Appointment marked as completed, may include shift results',
    schema: {
      example: {
        message: "Appointment completed. 2 appointment(s) shifted by total of 15 minutes.",
        shiftResult: {
          totalDelayMinutes: 20,
          appointmentsShifted: 2,
          delayDistributed: 15,
          appointmentsNeedingReschedule: 0,
          overflowAppointments: []
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async markAsCompleted(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteAppointmentDto,
  ) {
    return this.appointmentService.markAsCompleted(
      id, 
      dto.actualStartTime, 
      dto.actualEndTime
    );
  }

  @Get('doctor')
  @ApiOperation({ summary: 'Get all appointments for the logged-in doctor' })
  async doctorAppointments(@Req() req: any) {
    return await this.appointmentService.getDoctorAppointments(req.user.sub);
  }

  @Get('patient')
  @ApiOperation({ summary: 'Get all appointments for the logged-in patient' })
  async patientAppointments(@Req() req: any) {
    return await this.appointmentService.getPatientAppointments(req.user.sub);
  }

  @Get('doctor/needs-reschedule')
  @ApiOperation({ summary: 'Get appointments that need rescheduling due to time overflow' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of appointments requiring rescheduling',
    schema: {
      example: [{
        id: 123,
        appointmentDate: "2024-01-15",
        startTime: "16:30",
        endTime: "17:00",
        status: "needs_reschedule",
        patient: { id: 456, name: "John Doe" }
      }]
    }
  })
  async getAppointmentsNeedingReschedule(
    @Req() req: any,
    @Query('date') date?: string
  ) {
    const queryDate = date ? new Date(date) : undefined;
    return await this.appointmentService.getAppointmentsNeedingReschedule(
      req.user.sub, 
      queryDate
    );
  }

  @Get('doctor/schedule/:date')
  @ApiOperation({ summary: 'Get doctor schedule for a specific date' })
  async getDoctorScheduleForDate(
    @Param('date') date: string,
    @Req() req: any
  ) {
    // This could be a new service method to get organized schedule view
    const appointments = await this.appointmentService.getDoctorAppointments(req.user.sub);
    return appointments.filter(apt => 
      apt.appointmentDate.toISOString().split('T')[0] === date
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  @Get('analytics/doctor')
  @ApiOperation({ summary: 'Get appointment analytics for doctor' })
  async getDoctorAnalytics(@Req() req: any) {
    // You could add this method to service for analytics
    const appointments = await this.appointmentService.getDoctorAppointments(req.user.sub);
    
    const analytics = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
      rescheduledAppointments: appointments.filter(a => a.isRescheduled).length,
      needingReschedule: appointments.filter(a => a.rescheduleRequired).length
    };

    return {
      message: 'Doctor appointment analytics',
      data: analytics
    };
  }
}