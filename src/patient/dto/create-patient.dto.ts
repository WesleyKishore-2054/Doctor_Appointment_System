import { IsString, IsInt } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  gender: string;

  @IsInt()
  age: number;

  @IsString()
  bloodGroup: string;

  @IsString()
  medicalHistory: string;
}
