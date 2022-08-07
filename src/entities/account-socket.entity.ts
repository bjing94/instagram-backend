import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Account from './account.entity';

@Entity()
export default class AccountSocket {
  @PrimaryColumn({ length: 1024, name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'user_id' })
  user: Account;
}
