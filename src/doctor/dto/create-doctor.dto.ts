import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsArray,
  IsOptional,
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
  @IsNotEmpty()
  @IsBoolean()
  available: boolean;

  @IsOptional()
  @IsBoolean()
  fullDay?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots?: SlotDto[];
}

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  specialization: string;

  @IsNotEmpty()
  @IsString()
  qualification: string;

  @IsNotEmpty()
  @IsString()
  clinicAddress: string;

  @IsNotEmpty()
  @IsNumber()
  experience: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => DayAvailabilityDto)
  availability: Record<string, DayAvailabilityDto>;

}