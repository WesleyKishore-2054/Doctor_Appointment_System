import {
  Controller, Post, Get, Patch, Param, Query, Body, UseGuards, Req, NotFoundException} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreateDoctorDto) {
    return this.doctorService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getOwnProfile(@Req() req) {
    return this.doctorService.getOwnProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateOwnProfile(@Req() req, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.updateOwnProfile(req.user.sub, dto);
  }

  @Get('profile/:doctorId')
  getDoctorPublic(@Param('doctorId') id: number) {
    return this.doctorService.getPublicProfile(+id);
  }

  @Get()
  listDoctors(
    @Query('specialization') specialization?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.doctorService.listDoctors(specialization, page, limit);
  }
}
