import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Account from 'src/entities/account.entity';
import Comments from 'src/entities/comment.entity';
import Post from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import CreateCommentDto from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>,
  ) {}

  async create({
    post,
    replied_to,
    body,
    user,
  }: {
    post?: Post;
    replied_to?: Comments;
    user: Account;
    body: string;
  }) {
    if (post) {
      return this.commentRepository.save({
        body: body,
        user: user,
        post: post,
      });
    } else if (replied_to) {
      return this.commentRepository.save({
        body: body,
        user: user,
        replied_to: replied_to,
      });
    }
    return null;
  }

  async get(id: string) {
    return this.commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'account')
      .where('comment.id = :id', { id: id })
      .getOne();
  }

  async update(id: string, body: string) {
    return this.commentRepository.update({ id: id }, { body: body });
  }

  async delete(id: string) {
    return this.commentRepository.delete({ id: id });
  }
}
