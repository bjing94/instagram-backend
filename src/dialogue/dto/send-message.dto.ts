import { IsString } from 'class-validator';

export default class SendMessageDto {
  @IsString()
  body: string;
}
