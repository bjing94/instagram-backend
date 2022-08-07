import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export default class InviteDialogueDto {
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  usernames: string[];
}
