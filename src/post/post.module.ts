import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import Likes from 'src/entities/like.entity';
import PostImg from 'src/entities/post-img.entity';
import Post from 'src/entities/post.entity';
import { ImgModule } from 'src/img/img.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Post, PostImg, Likes]),
    ImgModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
