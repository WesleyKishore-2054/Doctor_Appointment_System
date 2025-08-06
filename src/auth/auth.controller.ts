import { Controller, Post, Body, UseGuards, Patch, Req, Delete } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { Sign } from "crypto";
import { SignInDto } from "./dto/signin.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { Public } from '../auth/decorators/public.decorator';


@Controller('user')
@Public()
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/signup')
    signup(@Body() dto: SignupDto)
    {
        return this.authService.signup(dto);
    }

    @Post('/signin')
    signin(@Body() dto: SignInDto){
        return this.authService.signin(dto);
    }

    @Post('/refreshToken')
    refresh(@Body('refreshToken') refreshToken:string)
    {
        return this.authService.refreshTokens(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/updateUser')
    update(@Req() req , @Body() dto: UpdateUserDto) {
        return this.authService.updateUser(req.user.sub, dto);
    }

        
    @UseGuards(JwtAuthGuard)
    @Delete('/deleteUser')
    delete(@Req() req) {
    return this.authService.deleteUser(req.user.sub);
    }
}