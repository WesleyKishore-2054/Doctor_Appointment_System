import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  specialization: string;

  @Column()
  qualification: string;

  @Column()
  experience: number;

  @Column()
  clinicAddress: string;

  @Column({ type: 'json', nullable: true })
  availability: Record<
  string,
  {
    available: boolean;
    fullDay?: boolean;
    slots?: { from: string; to: string }[];
  }
  >;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.doctors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
