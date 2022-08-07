import {
  CanActivate,
  ExecutionContext,
  Inject,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { DialogueService } from '../dialogue.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

export default class InDialogueGuard implements CanActivate {
  constructor(
    @Inject(UserService) private userService: UserService,
    @Inject(DialogueService) private dialogueService: DialogueService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // doesnt work if uuid is of wrong type.

    let req: any = context.switchToHttp().getRequest();
    let id = req.params.id;

    let user = await this.userService.get(req.user.id);

    let result = await this.dialogueService.isInDialogue(user.id, id);

    if (!result) {
      throw new UnauthorizedException('You are not member of this dialogue');
    }
    console.log(user.id, 'was  permitted');
    return result;
  }
}
