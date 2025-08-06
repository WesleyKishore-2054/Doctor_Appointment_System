import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AvailableSlotService } from './available-slot.service';
import { CreateAvailableSlotDto } from './dto/create-available-slot.dto';
import { UpdateAvailableSlotDto } from './dto/update-available-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';

@Controller('api/doctors/:doctorId/slots')
export class AvailableSlotController {
  constructor(
    private readonly availableSlotService: AvailableSlotService,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
  @Param('doctorId', ParseIntPipe) doctorId: number,
  @Body() dto: CreateAvailableSlotDto,
  @Req() req: any,)
   {
  const doctor = await this.doctorRepository.findOne({
    where: { user: { id: req.user.sub } },
  });

  if (!doctor || doctor.id !== doctorId) {
    throw new ForbiddenException('Unauthorized: Cannot create slot for another doctor');
  }

  if (dto.mode === 'stream') {
    if (!dto.slotDuration || !dto.patientGap) {
      throw new BadRequestException('Missing required fields for stream mode');
    }
  }
  if (dto.mode === 'wave') {
    if (!dto.slotDuration || !dto.groupSize) {
      throw new BadRequestException('Missing required fields for wave mode');
    }
  }

  return this.availableSlotService.create(doctorId, dto);
}


  @Get()
  async findAll(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return await this.availableSlotService.findByDoctor(doctorId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAvailableSlotDto,
  ) {
    return this.availableSlotService.update(id, updateDto);
  }

  

  @UseGuards(JwtAuthGuard)
  @Delete(':slotId')
  async delete(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req: any,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: req.user.sub } },
    });

    if (!doctor || doctor.id !== doctorId) {
      return { error: 'Unauthorized: Cannot delete another doctor’s slot' };
    }

    return await this.availableSlotService.delete(slotId, doctorId);
  }
}