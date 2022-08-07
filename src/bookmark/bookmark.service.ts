import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Bookmark from 'src/entities/bookmark.entity';
import { Repository } from 'typeorm';
import CreateBookmarkDto from './dto/create-bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepo: Repository<Bookmark>,
  ) {}

  async create(dto: CreateBookmarkDto) {
    return this.bookmarkRepo.save(dto);
  }

  async get(id: string) {
    return this.bookmarkRepo
      .createQueryBuilder('bookmark')
      .innerJoinAndSelect('bookmark.user', 'account')
      .innerJoinAndSelect('bookmark.post', 'post')
      .select(['bookmark.id', 'account.id', 'post.id'])
      .where('bookmark.id = :id', { id: id })
      .getOne();
  }

  async update(id: string, dto: Omit<CreateBookmarkDto, 'user'>) {
    return this.bookmarkRepo.update({ id: id }, dto);
  }

  async delete(id: string) {
    return this.bookmarkRepo.delete({ id: id });
  }

  async getBookmarksForUser(userId: string) {
    return this.bookmarkRepo
      .createQueryBuilder('bookmark')
      .innerJoinAndSelect('bookmark.user', 'account')
      .innerJoinAndSelect('bookmark.post', 'post')
      .where('bookmark.user.id = :userid', { userid: userId })
      .select(['bookmark.id', 'account.id', 'post.id'])
      .getMany();
  }
}
