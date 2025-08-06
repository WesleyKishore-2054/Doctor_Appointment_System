import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('patients')export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.patients)
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  bloodGroup: string;

  @Column({ nullable: true, type: 'text' })
  medicalHistory: string;

  @CreateDateColumn()
  created_at: Date;
}