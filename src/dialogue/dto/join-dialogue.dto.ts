import Account from 'src/entities/account.entity';
import Dialogue from 'src/entities/dialogue.entity';

export default class JoinDialogueDto {
  user: Account;
  dialogue: Dialogue;
}
