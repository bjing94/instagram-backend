import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import IsAccountOwnerGuard from './guards/is-account-owner.guard';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly bookmarkService: BookmarkService,
  ) {}

  @Get('all')
  async getAllUsers() {
    return this.userService.getAll();
  }

  @Get(':username')
  async get(@Param('username') username: string) {
    return this.userService.getUserByUsername(username);
  }

  @UseGuards(JWTAuthGuard)
  @Get('user/self')
  async getSelf(@Request() req: any) {
    return this.userService.get(req.user.id);
  }

  @UseGuards(JWTAuthGuard, IsAccountOwnerGuard)
  @Get(':username/saved')
  async getBookmarks(@Param('username') username: string) {
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException();
    }
    return this.bookmarkService.getBookmarksForUser(user.id);
  }
}
