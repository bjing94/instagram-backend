import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

export default class IsAccountOwnerGuard implements CanActivate {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();
    let username = request.body.username;
    let userId = request.user.id;
    let owner = await this.userService.getUserByUsername(username);
    return owner.id === userId;
  }
}
