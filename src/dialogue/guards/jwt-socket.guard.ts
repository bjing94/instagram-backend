import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

export default class JwtSocketGuard implements CanActivate {
  constructor(@Inject(AuthService) private authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    let client: Socket = context.switchToWs().getClient();

    await this.authService.getUserFromSocket(client);

    return true;
  }
}
