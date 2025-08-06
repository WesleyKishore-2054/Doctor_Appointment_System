import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailableSlot } from '../entities/available-slot.entity';
import { Doctor } from '../entities/doctor.entity';
import { AvailableSlotService } from './available-slot.service';
import { AvailableSlotController } from './available-slot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AvailableSlot, Doctor])],
  controllers: [AvailableSlotController],
  providers: [AvailableSlotService],
  exports:[TypeOrmModule],
})
export class AvailableSlotModule {}
