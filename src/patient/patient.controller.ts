import { Controller, Post, Body, UseGuards, Req, Get, Patch } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('patient')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  createProfile(@Body() dto: CreatePatientDto, @Req() req: Request) {
    const userId = (req.user as any).sub;
    return this.patientService.createProfile(userId, dto);
  }

  @Get('/profile')
  getOwnProfile(@Req() req: Request) {
    const userId = (req.user as any).sub;
    return this.patientService.getOwnProfile(userId);
  }

  @Patch('/profile/update')
  updateOwnProfile(@Body() dto: UpdatePatientDto, @Req() req: Request) {
    const userId = (req.user as any).sub;
    return this.patientService.updateOwnProfile(userId, dto);
  }
}
