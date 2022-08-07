import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Account from './account.entity';
import Post from './post.entity';

@Entity()
export default class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  body: string;

  @ManyToOne(() => Account, (acc: Account) => acc.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Account;

  @ManyToOne(() => Post, (post: Post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comments, (com: Comments) => com.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'replied_to' })
  replied_to: Comments;

  @OneToMany(() => Comments, (com: Comments) => com.replied_to, {
    nullable: true,
  })
  replies: Comments[];

  @CreateDateColumn()
  @JoinColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn()
  @JoinColumn({ name: 'updated_at' })
  updated_at: Date;
}
