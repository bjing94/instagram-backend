import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AccountDialogue from './account-dialogue.entity';
import Bookmark from './bookmark.entity';
import Comments from './comment.entity';
import Dialogue from './dialogue.entity';
import Likes from './like.entity';
import Message from './message.entity';
import Post from './post.entity';

@Entity()
export default class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  username: string;

  @Column({ length: 4095 })
  passwordHash: string;

  @Column({ length: 1023, unique: true })
  email: string;

  @OneToMany(() => Post, (post: Post) => post.user)
  posts: Post[];

  @OneToMany(() => Likes, (like: Likes) => like.user)
  likes: Likes[];

  @OneToMany(() => Comments, (comm: Comments) => comm.user)
  comments: Comments[];

  @OneToMany(() => Bookmark, (bm: Bookmark) => bm.user)
  bookmarks: Bookmark[];

  @OneToMany(() => Dialogue, (dg: Dialogue) => dg.owner)
  ownedDialogues: Dialogue[];

  @OneToMany(() => AccountDialogue, (accDg: AccountDialogue) => accDg.user)
  accountDialogues: AccountDialogue[];

  @OneToMany(() => Message, (msg: Message) => msg.user)
  messages: Message[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
