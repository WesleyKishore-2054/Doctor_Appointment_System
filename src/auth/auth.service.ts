import { Injectable, ConflictException } from "@nestjs/common";
import { SignupDto, UserRole } from "./dto/signup.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from "./dto/signin.dto";
import { UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from "./dto/update-user.dto";


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo:Repository<User>,
        private jwtService: JwtService,
    ) {}

    async signup(dto: SignupDto){
        const existing= await this.userRepo.findOne({where: {email:dto.email } });
        if(existing)
            throw new ConflictException('User Already existed');

        const hashedPassword=await bcrypt.hash(dto.password,10);
        const user= this.userRepo.create({
            name:dto.name,
            email:dto.email,
            password:hashedPassword,
            role:dto.role,
        });

        await this.userRepo.save(user);
        const tokens =await this.generateTokens(user.id,user.email,  user.role);
        const hashedRefreshToken= await bcrypt.hash(tokens.refresh_token,10);
        await this.userRepo.update(user.id,{ refreshToken: hashedRefreshToken});

        return { message: "Registration Success" };
        }

    //sign-in

    async signin(dto: SignInDto)
    {
        const user=await this.userRepo.findOne({ where: { email: dto.email}});
        if(!user)
            throw new Error('Invalid Credentials, Check the Entered email');

        if(!(await bcrypt.compare(dto.password, user.password)))
            throw new Error('Invalid Password');

        const tokens= await this.generateTokens(user.id , user.email, user.role);
        const hashedRt = await bcrypt.hash(tokens.refresh_token, 10);
        await this.userRepo.update(user.id, { refreshToken: hashedRt });
        return {tokens, userId:user.id};
    }

    //RefreshToken

    async refreshTokens(refreshToken: string){
        try{
            const payload =await this.jwtService.verifyAsync( refreshToken,{
                secret:'REFRESH_SECRET',
            });

        const user = await this.userRepo.findOne({ where: { id:payload.sub }});
        if( !user || !user.refreshToken)
            throw new Error ('Access Denied');


        const isMatch= await bcrypt.compare(refreshToken,user.refreshToken);
        if(!isMatch)
            throw new Error('Invalid Refresh Token');

        const tokens = await this.generateTokens(user.id,user.email, user.role);
        const hashedRT= await bcrypt.hash(tokens.refresh_token,10);
        await this.userRepo.update(user.id, {
            refreshToken:hashedRT
        });
        return {tokens,userId:user.id};    
    }
    catch{
        throw new Error('Invalid or Expired Refresh Token');
    }

}

   //update 
    async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.update(userId, dto);
    return { message: 'User updated successfully',userId:user.id };
    }

    //delete
    async deleteUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    await this.userRepo.delete(userId);
    return { userId:user.id,message: 'User deleted successfully' };
    }

    async generateTokens(userId:number, email:string, role:string)
    {
        const payload={sub:userId, email,role};
        const [access_token,refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: 'ACCESS_SECRET',
                expiresIn:'1h',
            }),
            this.jwtService.signAsync(payload, {
                secret:'REFRESH_SECRET',
                expiresIn:'7d',
            }),
        ]);
        return {
            access_token,
            refresh_token,
        };
    }

}