import Account from 'src/entities/account.entity';
import Dialogue from 'src/entities/dialogue.entity';
import { IsString } from 'class-validator';

export default class CreateMessageDto {
  @IsString()
  body: string;

  user: Account;
  dialogue: Dialogue;

  @IsString()
  type: 'message' | 'event';
}
