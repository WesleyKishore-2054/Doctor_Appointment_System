import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({ secret: 'ACCESS_SECRET' }),
    PassportModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
