import { IsString } from 'class-validator';

export default class CreateBookmarkDto {
  @IsString()
  postId: string;
}
