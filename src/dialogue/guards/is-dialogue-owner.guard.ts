import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { DialogueService } from '../dialogue.service';
import { Socket } from 'socket.io';

export default class IsDialogueOwnerGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(DialogueService) private dialogueService: DialogueService,
  ) {}
  async canActivate(context: ExecutionContext) {
    let client: Socket = context.switchToWs().getClient();
    let data = context.switchToWs().getData();

    let user = await this.authService.getUserFromSocket(client);

    let result = await this.dialogueService.get(data.dialogueId);
    if (result.owner !== user) {
      console.log(user.id, 'was not permitted');
      throw new WsException('You are not owner of this dialogue');
    }
    console.log(user.id, 'was  permitted');
    return false;
  }
}
