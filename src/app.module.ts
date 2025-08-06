import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { HelloController } from './hello/hello.controller';
import { HelloService } from './hello/hello.service';
import { AppointmentReassignmentModule } from './appointmentReassignment/reassignment.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule'; 
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { AvailableSlotModule } from './available-slot/available-slot.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { AppointmentModule } from './appointment/appointment.module';
import { AppointmentQueue } from './entities/appointmentQueue.entity';
import { RescheduleModule } from './reschedule/reschedule.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'wesleyMsd07***',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: false,
      migrationsRun: false,
    }),
    AuthModule,
    DoctorModule,
    PatientModule,
    AvailableSlotModule,
    AppointmentModule,
    AppointmentReassignmentModule,
    RescheduleModule  
  ],
  controllers: [HelloController],
  providers: [
    HelloService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
