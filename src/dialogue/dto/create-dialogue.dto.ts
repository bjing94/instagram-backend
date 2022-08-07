import Account from 'src/entities/account.entity';

export default class CreateDialogueDto {
  otherUsernames: string[];
  title?: string;
}
