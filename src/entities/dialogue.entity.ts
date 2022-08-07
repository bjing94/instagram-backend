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
import AccountDialogue from './account-dialogue.entity';
import Account from './account.entity';
import Message from './message.entity';

@Entity()
export default class Dialogue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, length: 511 })
  title: string;

  @Column({ length: 127 })
  category: string;

  @ManyToOne(() => Account, (acc: Account) => acc.ownedDialogues)
  @JoinColumn({ name: 'owner' })
  owner: Account;

  @OneToMany(() => Message, (msg: Message) => msg.dialogue)
  messages: Message[];

  @OneToMany(() => AccountDialogue, (accDg: AccountDialogue) => accDg.dialogue)
  @JoinColumn({ name: 'account_dialogues' })
  accountDialogues: AccountDialogue[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
