import {
  IsOptional,
  IsDateString,
  IsString,
  IsEnum,
  IsInt,
} from 'class-validator';

export enum SlotMode {
  STREAM = 'stream',
  WAVE = 'wave',
}

export class UpdateAvailableSlotDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsEnum(SlotMode)
  mode?: SlotMode;

  @IsOptional()
  @IsInt()
  maxBookings?: number;

  @IsOptional()
  @IsInt()
  slotDuration?: number;

  @IsOptional()
  @IsInt()
  patientGap?: number;
}