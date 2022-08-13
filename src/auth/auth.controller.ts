import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import RegisterAccountDto from './auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import Account from 'src/entities/account.entity';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';

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
  async login(
    @Request() req: Express.Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(req.user as Account);
    response.cookie('auth-cookie', `${token.access_token}`, {
      httpOnly: true,
    });
  }

  @UseGuards(JWTAuthGuard)
  @Get('profile')
  async profile(@Request() req: any) {
    // console.log('Cookies', req.cookies);
    return req.user;
  }

  @Get('check')
  async checkAuth(@Request() req: any) {
    const token = req.cookies['auth-cookie'];
    const isValid = await this.authService
      .validateToken(token)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
    return {
      auth: isValid,
    };
  }
}
