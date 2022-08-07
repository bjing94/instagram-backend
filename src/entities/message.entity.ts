import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Account from './account.entity';
import Dialogue from './dialogue.entity';

@Entity()
export default class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (acc: Account) => acc.messages)
  @JoinColumn({ name: 'user_id' })
  user: Account;

  @ManyToOne(() => Dialogue, (dg: Dialogue) => dg.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dialogue_id' })
  dialogue: Dialogue;

  @Column({ length: 1023 })
  body: string;

  @Column()
  type: string;
  // message or event

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
