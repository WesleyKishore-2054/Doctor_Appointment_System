import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['patient', 'doctor'] })
  role: 'patient' | 'doctor';

  @OneToMany(() => Doctor, (doctor) => doctor.user)
  doctors: Doctor[];

  
  @OneToMany(() => Patient, (patient) => patient.user)
  patients: Patient[];

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

}
