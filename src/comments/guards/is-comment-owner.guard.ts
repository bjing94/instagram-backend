import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { PostService } from 'src/post/post.service';
import { CommentsService } from '../comments.service';

export default class IsCommentOwnerGuard implements CanActivate {
  constructor(
    @Inject(CommentsService) private readonly commentsService: CommentsService,
  ) {}
  async canActivate(context: ExecutionContext) {
    let { id } = (context.switchToHttp().getRequest() as Request).params;
    let comment = await this.commentsService.get(id);
    console.log(comment);
    if (!comment) return false;

    let request = context.switchToHttp().getRequest();
    let user = request.user;
    if (user.id !== comment.user.id) return false;
    return true;
  }
}
