import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  newDate: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'newStartTime must be in HH:MM format',
  })
  newStartTime: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'newEndTime must be in HH:MM format',
  })
  newEndTime: string;
}