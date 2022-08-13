import { IsOptional, IsString } from 'class-validator';

export default class CreateCommentDto {
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
