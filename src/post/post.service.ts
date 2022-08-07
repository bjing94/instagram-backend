import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Account from 'src/entities/account.entity';
import Img from 'src/entities/img.entity';
import Likes from 'src/entities/like.entity';
import PostImg from 'src/entities/post-img.entity';
import Post from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import CreatePostDto from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostImg)
    private readonly postImgRepo: Repository<PostImg>,
    @InjectRepository(Likes)
    private readonly likesRepo: Repository<Likes>,
  ) {}

  async create(dto: CreatePostDto) {
    return this.postRepo.save(dto);
  }

  async get(id: string) {
    return this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.id = :id', { id: id })
      .getOne();
  }

  async getAll() {
    return this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.post_imgs', 'post_img')
      .leftJoinAndSelect('post_img.img', 'img')
      .getMany();
  }

  async update(id: string, dto: any) {
    return this.postRepo.update({ id: id }, dto);
  }

  async delete(id: string) {
    return this.postRepo.delete({ id: id });
  }

  async linkImgToPost(img: Img, post: Post) {
    return this.postImgRepo.save({ post: post, img: img });
  }

  async removeLinkedImgToPost(imgId: string) {
    return this.postImgRepo.delete({ img: { id: imgId } });
  }

  async likePost(user: Account, post: Post) {
    return this.likesRepo.save({ user: user, post: post });
  }
}
