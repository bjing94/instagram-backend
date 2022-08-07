import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import PostImg from './post-img.entity';

@Entity()
export default class Img {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 2047 })
  src: string;

  @Column({ length: 127 })
  imgType: string;

  @OneToMany(() => PostImg, (post_img: PostImg) => post_img.img)
  post_imgs: PostImg[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
