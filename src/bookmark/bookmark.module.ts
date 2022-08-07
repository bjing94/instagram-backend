import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Bookmark from 'src/entities/bookmark.entity';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';
import BookmarkController from './bookmark.controller';
import { BookmarkService } from './bookmark.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark]), UserModule, PostModule],
  providers: [BookmarkService],
  exports: [BookmarkService],
  controllers: [BookmarkController],
})
export class BookmarkModule {}
