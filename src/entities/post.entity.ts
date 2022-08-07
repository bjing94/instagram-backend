import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Account from './account.entity';
import Bookmark from './bookmark.entity';
import Comments from './comment.entity';
import Likes from './like.entity';
import PostImg from './post-img.entity';

@Entity()
export default class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Account, (acc: Account) => acc.posts, {
    onDelete: 'CASCADE',
  })
  user: Account;

  @OneToMany(() => PostImg, (post_img: PostImg) => post_img.post)
  post_imgs: PostImg[];

  @OneToMany(() => Likes, (like: Likes) => like.post)
  likes: Likes[];

  @OneToMany(() => Comments, (comm: Comments) => comm.post)
  comments: Comments[];

  @OneToMany(() => Bookmark, (bm: Bookmark) => bm.user)
  bookmarks: Bookmark[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
