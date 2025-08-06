import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

export type SlotMode = 'stream' | 'wave';

@Entity('available_slots')
export class AvailableSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: ['stream', 'wave'] })
  mode: SlotMode;

  @Column({ type: 'int', nullable: false })
  maxBookings: number;

  @Column({ type: 'int', nullable: true })
  slotDuration: number; // duration in minutes (for stream mode)

  @Column({ type: 'int', nullable: true })
  patientGap: number; // gap between patients in minutes (for stream mode)

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  emergency: boolean;

  @Column({ type: 'int', nullable: true })
  groupSize?: number;

  @Column({ nullable: true })
  waveGap?: number;
}