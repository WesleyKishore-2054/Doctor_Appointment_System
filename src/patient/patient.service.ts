import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { User } from '../entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createProfile(userId: number, dto: CreatePatientDto): Promise<{message:string,savedPatient:Patient}
  
  > {
  try {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const patient = this.patientRepository.create({ ...dto, user });
    await this.patientRepository.save(patient);

    const savedPatient = await this.patientRepository.findOneBy({ user: { id: userId } });

    if (!savedPatient) 
        throw new NotFoundException('Patient profile not found');
    return {message:"Profile Created",savedPatient};  
    } 
    catch (error) {
    throw error;
  }
}

  async getOwnProfile(userId: number): Promise<{patient:Patient,userId:number}> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!patient) throw new NotFoundException('Patient profile not found');
      return {patient:patient,userId};
    } catch (error) {
      throw error;
    }
  }

  async updateOwnProfile(userId: number, dto: UpdatePatientDto): Promise<{patient:Patient,userId:number}> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!patient) throw new NotFoundException('Patient profile not found');

      Object.assign(patient, dto);
          const updatedPatient = await this.patientRepository.save(patient);

      return await {patient:updatedPatient,userId};
    } catch (error) {
      throw error;
    }
  }
}
