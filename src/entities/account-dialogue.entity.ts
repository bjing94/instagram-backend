import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Account from './account.entity';
import Dialogue from './dialogue.entity';
import Message from './message.entity';

@Entity()
export default class AccountDialogue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (acc: Account) => acc.accountDialogues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Account;

  @ManyToOne(() => Dialogue, (dg: Dialogue) => dg.accountDialogues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dialogue_id' })
  dialogue: Dialogue;

  @Column('boolean')
  active: boolean;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'first_msg_id' })
  firstMessage: Message;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'first_visible_msg_id' })
  firstVisibleMessage: Message;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'last_visible_msg_id' })
  lastVisibleMessage: Message;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
