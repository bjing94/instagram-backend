import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from 'src/post/post.service';
import { CommentsService } from './comments.service';
import CreateCommentDto from './dto/create-comment.dto';
import IsCommentOwnerGuard from './guards/is-comment-owner.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly postService: PostService,
    private readonly commentsService: CommentsService,
    private readonly authService: AuthService,
  ) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(JWTAuthGuard)
  @Post()
  async create(@Body() dto: CreateCommentDto, @Request() request: any) {
    const user = await this.authService.find(request.user.id);
    if (!user) {
      throw new BadRequestException();
    }
    if (dto.postId) {
      const post = await this.postService.get(dto.postId);
      const newComment = await this.commentsService.create({
        post: post,
        body: dto.body,
        user: user,
      });
      return newComment;
    } else if (dto.parentCommentId) {
      const comment = await this.commentsService.get(dto.parentCommentId);
      const newComment = await this.commentsService.create({
        replied_to: comment,
        body: dto.body,
        user: user,
      });
      return newComment;
    }
    throw new BadRequestException();
  }

  @Get(':id')
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.commentsService.get(id);
    if (!result) {
      throw new NotFoundException();
    }
    const { id: resultId, body, created_at, updated_at, user } = result;
    return {
      id: resultId,
      body,
      created_at,
      updated_at,
      username: user.username,
    };
  }

  @UseGuards(JWTAuthGuard, IsCommentOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('body') body: string,
  ) {
    let comment = await this.commentsService.get(id);
    if (!comment) {
      throw new NotFoundException();
    }

    let update = await this.commentsService.update(id, body);
    return {
      message: 'Comment updated successfully!',
    };
  }

  @UseGuards(JWTAuthGuard, IsCommentOwnerGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    let comment = await this.commentsService.get(id);
    if (!comment) {
      throw new NotFoundException();
    }

    await this.commentsService.delete(id);
    return {
      message: 'Comment deleted successfully!',
    };
  }
}
