import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['pending', 'Booked', 'cancelled', 'completed'])
  status: string;
}
