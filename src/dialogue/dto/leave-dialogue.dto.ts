import { IsString } from 'class-validator';
import Account from 'src/entities/account.entity';
import Dialogue from 'src/entities/dialogue.entity';

export default class LeaveDialogueDto {
  @IsString()
  userId: string;

  @IsString()
  dialogueId: string;
}
