import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { User } from '../entities/user.entity';
@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(userId: number, dto: CreateDoctorDto) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const doctor = this.doctorRepo.create({ ...dto,availability: dto.availability, user });
      const saved = await this.doctorRepo.save(doctor);

      return {
        message: 'Doctor profile created successfully',
        data: saved,
        doctorId:saved.id,
        userId:saved.id,
      };
    } catch (err) {
      throw new Error('Failed to create doctor profile: ' + err.message);
    }
  }

  async getOwnProfile(userId: number) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!doctor) throw new Error('Doctor profile not found');

      return {
        message: 'Doctor profile fetched successfully',
        data: doctor,
        userID:userId,
        doctorId: doctor.id,
      };
    } catch (err) {
      throw new Error('Failed to fetch profile: ' + err.message);
    }
  }

  async updateOwnProfile(userId: number, dto: UpdateDoctorDto) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { user: { id: userId } },
      });
      if (!doctor) throw new Error('Doctor profile not found');

      Object.assign(doctor, dto);
      const updated = await this.doctorRepo.save(doctor);

      return {
        message: 'Doctor profile updated successfully',
        data: updated,
        userID:userId,
        doctorId: doctor.id,
      };
    } catch (err) {
      throw new Error('Failed to update profile: ' + err.message);
    }
  }

  async getPublicProfile(id: number) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!doctor) throw new Error('Doctor not found');

      const { specialization, experience, qualification, user, availability } = doctor;
      return {
        message: 'Doctor public profile fetched',
        data: {
          name: user.name,
          specialization,
          experience,
          qualification,
          availability: formatAvailability(availability),
        },
      };
    } catch (err) {
      throw new Error('Failed to fetch public profile: ' + err.message);
    }
    function formatAvailability(availability: any) {
  const days = Object.keys(availability || {});
  return days.map((day) => {
    const { from, to, fullDay } = availability[day];
    return {
      day,
      from: fullDay ? 'Full Day' : from,
      to: fullDay ? '' : to,
      fullDay,
    };
  });
}
  }

  async listDoctors(specialization?: string, page = 1, limit = 10) {
    try {
      const where = specialization
        ? { specialization: Like(`%${specialization}%`) }
        : {};

      const [doctors, total] = await this.doctorRepo.findAndCount({
        where,
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        message: 'Doctors list fetched successfully',
        data: doctors.map((d) => ({
          id: d.id,
          name: d.user.name,
          specialization: d.specialization,
          experience: d.experience,
          qualification: d.qualification,
        })),
        total,
        page,
        limit,
      };
    } catch (err) {
      throw new Error('Failed to list doctors: ' + err.message);
    }
  }
 
}

