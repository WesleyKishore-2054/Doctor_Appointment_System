import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsArray,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

class SlotDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;
}

class DayAvailabilityDto {
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsBoolean()
  fullDay?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots?: SlotDto[];
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @IsOptional()
  @IsNumber()
  experience?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => DayAvailabilityDto)
  availability?: Record<string, DayAvailabilityDto>;
}