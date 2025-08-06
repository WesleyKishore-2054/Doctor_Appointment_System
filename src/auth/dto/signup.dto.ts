import{IsEmail,IsEnum, IsNotEmpty,MinLength} from 'class-validator';

export enum UserRole{
    PATIENT='patient',
    DOCTOR='doctor'
}

export class SignupDto{
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email:string;

    @MinLength(6)
    password:string;

    @IsEnum(UserRole)
    role: UserRole;
}