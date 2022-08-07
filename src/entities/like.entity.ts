import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import Account from './account.entity';
import Post from './post.entity';

@Entity()
@Unique(['user', 'post'])
export default class Likes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Who liked
  @ManyToOne(() => Account, (acc: Account) => acc.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Account;

  // What liked
  @ManyToOne(() => Post, (post: Post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
