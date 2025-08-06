import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AvailableSlot } from 'src/entities/available-slot.entity';
import { AvailableSlotModule } from 'src/available-slot/available-slot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Doctor, Patient,AvailableSlot]),
    AvailableSlotModule,
  ],
  providers: [AppointmentService],
  controllers: [AppointmentController]
})
export class AppointmentModule {}