import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Img from './img.entity';
import Post from './post.entity';

@Entity()
export default class PostImg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post: Post) => post.id, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Img, (img: Img) => img.id, { onDelete: 'CASCADE' })
  img: Img;
}
