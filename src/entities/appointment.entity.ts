import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';
import { AvailableSlot } from './available-slot.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

 @ManyToOne(() => Patient)
patient: Patient;

@ManyToOne(() => Doctor)
doctor: Doctor;

@ManyToOne(() => AvailableSlot)
slot: AvailableSlot;

  @Column({ type: 'date' })
  appointmentDate: Date;

  @Column({ type: 'varchar', nullable: true })
  day: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isRescheduled: boolean;

  @Column({ type: 'date', nullable: true })
  originalDate: Date;

  @Column({ type: 'time', nullable: true })
  originalStartTime: string;

  @Column({ type: 'time', nullable: true })
  originalEndTime: string;

  @Column({ type: 'varchar', nullable: true })
  cancelledBy: 'doctor' | 'patient';

  @Column({ type: 'boolean', default: false })
  rescheduleRequired: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'time', nullable: true })
  actualStartTime: string;

  @Column({ type: 'time', nullable: true })
  actualEndTime: string;
  
}
  