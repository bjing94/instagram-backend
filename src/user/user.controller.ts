import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  async getAllUsers() {
    return this.userService.getAll();
  }

  // @Get(':username')
  // async get(@Param('username') username: string) {
  //   return this.userService.getUserByUsername(username);
  // }

  @UseGuards(JWTAuthGuard)
  @Get('user/self')
  async getSelf(@Request() req: any) {
    return this.userService.get(req.user.id);
  }
}
