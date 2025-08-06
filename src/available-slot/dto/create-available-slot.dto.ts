import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  ValidateIf,
  IsBoolean,
  Validate,
} from 'class-validator';

export class CreateAvailableSlotDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsEnum(['stream', 'wave'])
  mode: 'stream' | 'wave';

  @IsInt()
  @Min(1)
  maxBookings: number;

  @ValidateIf((o) => o.mode === 'stream')
  @IsInt()
  @Min(1)
  slotDuration?: number;

  @ValidateIf((o) => o.mode === 'stream')
  @IsInt()
  @Min(0)
  patientGap?: number;

  @IsOptional()
  @IsBoolean()
  emergency?: boolean;

  @ValidateIf((o) => o.mode=== 'wave')
  @IsInt()
  @Min(3)
  groupSize?:number;

  @ValidateIf(o => o.mode === 'wave')
  @IsInt()
  @Min(0)
  waveGap?: number;

}