import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { BookmarkService } from './bookmark.service';
import CreateBookmarkDto from './dto/create-bookmark.dto';

@Controller('saved')
export default class BookmarkController {
  constructor(
    private readonly bookmarkService: BookmarkService,
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @UseGuards(JWTAuthGuard)
  @Get(':id')
  async getBookmark(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const userId = req.user.id;
    const user = await this.userService.get(userId);
    if (!user) {
      throw new NotFoundException();
    }

    let bookmark = await this.bookmarkService.get(id);
    if (!bookmark) throw new NotFoundException();
    if (bookmark.user.id !== userId) throw new UnauthorizedException();

    return bookmark;
  }

  @UseGuards(JWTAuthGuard)
  @Get()
  async getBookmarks(@Request() req: any) {
    const userId = req.user.id;
    const user = await this.userService.get(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return this.bookmarkService.getBookmarksForUser(user.id);
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(JWTAuthGuard)
  @Post()
  async createBookmark(@Request() req: any, @Body() dto: CreateBookmarkDto) {
    const { postId } = dto;
    const userId = req.user.id;
    const user = await this.userService.get(userId);
    const post = await this.postService.get(postId);
    if (!user || !post) {
      throw new NotFoundException();
    }

    return this.bookmarkService.create({
      user: user,
      post: post,
    });
  }

  @UseGuards(JWTAuthGuard)
  @Delete(':id')
  async deleteBookmark(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const user = await this.userService.get(userId);
    if (!user) {
      throw new NotFoundException();
    }

    const bookmark = await this.bookmarkService.get(id);
    if (!bookmark) throw new NotFoundException();
    if (bookmark.user.id !== userId) throw new UnauthorizedException();

    return this.bookmarkService.delete(id);
  }
}
