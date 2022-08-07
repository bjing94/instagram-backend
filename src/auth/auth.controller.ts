import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import RegisterAccountDto from './auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import Account from 'src/entities/account.entity';
import { JWTAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterAccountDto) {
    const result = await this.authService.create(body);

    return result;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request) {
    return this.authService.login(req.user as Account);
  }

  @UseGuards(JWTAuthGuard)
  @Get('profile')
  async profile(@Request() req: Express.Request) {
    return req.user;
  }
}
