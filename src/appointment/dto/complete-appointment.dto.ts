import {
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CompleteAppointmentDto {
  @IsNotEmpty({ message: 'Actual start time is required' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:mm format'
  })
  actualStartTime: string;

  @IsNotEmpty({ message: 'Actual end time is required' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:mm format'
  })
  actualEndTime: string;
}
