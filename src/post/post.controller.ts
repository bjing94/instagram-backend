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
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryFailedExceptionFilter } from 'src/exception/query-failed.exception.filter';
import { ImgService } from 'src/img/img.service';
import CreatePostDto from './dto/create-post.dto';
import UpdatePostDto from './dto/update-post.dto';
import IsPostOwnerGuard from './guards/is-post-owner.guard';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly authService: AuthService,
    private readonly imgService: ImgService,
  ) {}

  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: Omit<CreatePostDto, 'user'>,
    @Request() req: any,
  ) {
    // Get our user from jwt token.
    const jwtPayload = req.user;
    const user = await this.authService.find(jwtPayload.sub);
    if (!user) {
      throw new NotFoundException();
    }

    // Create post.
    const createdPost = await this.postService.create({
      user: user,
      description: dto.description,
    });

    for (let file of files) {
      const savedImage = await this.imgService.create(file);
      await this.postService.linkImgToPost(savedImage, createdPost);
    }

    return createdPost;
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.postService.get(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get()
  async getAllPosts() {
    return this.postService.getAll();
  }

  @UseGuards(JWTAuthGuard, IsPostOwnerGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Patch(':id')
  @UseFilters(new QueryFailedExceptionFilter())
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePostDto,
    @Request() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const post = await this.postService.get(id);
    if (!post) {
      throw new NotFoundException();
    }

    if (dto.liking && dto.liking === true) {
      const likingUser = await this.authService.find(req.user.sub);
      if (!likingUser) {
        throw new BadRequestException();
      }
      await this.postService.likePost(likingUser, post);
      return {
        message: 'Liked successfully',
      };
    }

    const { description, newImageIds } = dto;
    const updatedPost = await this.postService.update(id, { description });

    // Remove old images
    if (newImageIds !== undefined && newImageIds.length !== 0) {
      const currentImageIds = post.post_imgs.map((post_img) => post_img.img.id);

      for (let imgId of newImageIds) {
        if (currentImageIds.findIndex((id) => id === imgId) === -1) {
          await this.postService.removeLinkedImgToPost(imgId);
        }
      }
    }

    // Add new images
    if (files.length !== 0) {
      for (let file of files) {
        const savedImage = await this.imgService.create(file);
        await this.postService.linkImgToPost(savedImage, post);
      }
    }

    return post;
  }

  @UseGuards(JWTAuthGuard, IsPostOwnerGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const post = await this.postService.get(id);
    if (!post) {
      throw new NotFoundException();
    }

    const result = await this.postService.delete(id);
    return result;
  }
}
