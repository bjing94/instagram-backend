import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { PostService } from '../post.service';

@Injectable()
export default class IsPostOwnerGuard implements CanActivate {
  constructor(@Inject(PostService) private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext) {
    let { id } = (context.switchToHttp().getRequest() as Request).params;
    let post = await this.postService.get(id);
    if (!post) return false;

    let request = context.switchToHttp().getRequest();
    let user = request.user;
    console.log('user', user.sub, 'owner', post.user.id);
    if (user.sub !== post.user.id) return false;
    return true;
  }
}
