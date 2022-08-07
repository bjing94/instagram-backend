import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { DialogueService } from './dialogue.service';
import CreateDialogueDto from './dto/create-dialogue.dto';
import CreateMessageDto from './dto/create-message.dto';
import InviteDialogueDto from './dto/invite-dialogue.dto';
import SendMessageDto from './dto/send-message.dto';
import InDialogueGuard from './guards/in-dialogue.guard';

@Controller('direct')
export default class DialogueController {
  constructor(
    private readonly dialogueService: DialogueService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JWTAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('inbox')
  async create(@Body() dto: CreateDialogueDto, @Request() req: any) {
    const { otherUsernames, title } = dto;
    const userId = req.user.id;

    const user = await this.userService.get(userId);
    let uniqueUsernames = Array.from(new Set(otherUsernames));
    uniqueUsernames = uniqueUsernames.filter(
      (username) => username !== user.username,
    );

    if (uniqueUsernames.length === 0) throw new BadRequestException();
    const category = uniqueUsernames.length === 1 ? 'dialogue' : 'chat';
    let allUsersExist = await this.userService.validateUsersByUsernames(
      uniqueUsernames,
    );
    if (!allUsersExist) throw new BadRequestException('Users do not exist');

    let hasDuplicate = await this.dialogueService.hasDuplicate([
      ...uniqueUsernames,
      user.username,
    ]);
    // if (hasDuplicate)
    //   throw new BadRequestException('Such dialogue already exists');

    let dialogueTitle = '';
    if (uniqueUsernames.length === 1) {
      dialogueTitle = `${uniqueUsernames[0]}`;
    } else {
      dialogueTitle = user.username + ', ';
      dialogueTitle += title ? title : uniqueUsernames.join(', ');
    }

    const newDialogue = await this.dialogueService.createDialogue(
      userId,
      uniqueUsernames,
      category,
      dialogueTitle,
    );

    const messageDto: CreateMessageDto = {
      body: `${user.username} created dialogue ${dialogueTitle}`,
      user: user,
      dialogue: newDialogue,
      type: 'event',
    };
    await this.dialogueService.addMessage(messageDto);

    return newDialogue;
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(JWTAuthGuard)
  @Get('t/:id')
  async get(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
    let userId = req.user.id;
    let result = await this.dialogueService.get(id);
    if (!result) throw new NotFoundException();

    let inDialogue = await this.dialogueService.isInDialogue(userId, result.id);
    let wasInDialogue = await this.dialogueService.wasInDialogue(
      userId,
      result.id,
    );
    let usersInDialogue = await this.dialogueService.getUsersInDialogue(
      result.id,
    );

    if (!inDialogue && !wasInDialogue) {
      throw new UnauthorizedException();
    } else if (!inDialogue) {
      let leaveDate = await this.dialogueService.getLeaveDate(
        userId,
        result.id,
      );

      let filteredMessages = await this.dialogueService.getMessagesUntilDate(
        id,
        leaveDate,
      );
      result.messages = filteredMessages;
      return { ...result, users: usersInDialogue.map((user) => user.username) };
    } else {
      return { ...result, users: usersInDialogue.map((user) => user.username) };
    }
  }

  @UseGuards(JWTAuthGuard)
  @Get('inbox')
  async getUserDialogues(@Request() req: any) {
    const result = await this.dialogueService.getUserDialogues(req.user.id);
    return result;
  }

  @UseGuards(JWTAuthGuard)
  @Post('t/:id/leave')
  async leaveDialogue(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ) {
    console.log('leaving');
    let dialogue = await this.dialogueService.get(id);
    if (!dialogue) throw new NotFoundException();

    if (dialogue.category === 'dialogue')
      throw new BadRequestException('Cant leave a dialogue');

    let userId = req.user.id;
    let inDialogue = await this.dialogueService.isInDialogue(
      userId,
      dialogue.id,
    );
    if (!inDialogue) {
      throw new UnauthorizedException('not in dialogue');
    }

    let user = await this.userService.get(userId);

    const leaveMessage: CreateMessageDto = {
      body: `${user.username} left dialogue`,
      user: user,
      dialogue: dialogue,
      type: 'event',
    };
    await this.dialogueService.addMessage(leaveMessage);

    await this.dialogueService.leaveDialogue({
      dialogueId: id,
      userId: userId,
    });
  }

  @UseGuards(JWTAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('t/:id')
  async sendMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
    @Body() dto: SendMessageDto,
  ) {
    let dialogue = await this.dialogueService.get(id);
    if (!dialogue) throw new NotFoundException();

    let userId = req.user.id;
    let inDialogue = await this.dialogueService.isInDialogue(
      userId,
      dialogue.id,
    );
    if (!inDialogue) {
      throw new UnauthorizedException();
    }

    let user = await this.userService.get(userId);
    const { body } = dto;
    const messageDto: CreateMessageDto = {
      body: body,
      user: user,
      dialogue: dialogue,
      type: 'message',
    };
    await this.dialogueService.addMessage(messageDto);
  }

  @UseGuards(JWTAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('t/:id/invite')
  async inviteToChat(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
    @Body() dto: InviteDialogueDto,
  ) {
    let dialogue = await this.dialogueService.get(id);
    if (!dialogue) throw new NotFoundException();

    let userId = req.user.id;
    let inDialogue = await this.dialogueService.isInDialogue(
      userId,
      dialogue.id,
    );
    if (!inDialogue) {
      throw new UnauthorizedException();
    }

    const { usernames } = dto;

    let allExist = await this.userService.validateUsersByUsernames(usernames);
    if (!allExist) {
      throw new BadRequestException('User not found');
    }
    let newUsers = await this.userService.getUsersByUsername(usernames);

    let usersInDialogue = await this.dialogueService.getUsersInDialogue(
      dialogue.id,
    );
    for (let newUser of newUsers) {
      if (
        usersInDialogue.find((user) => {
          return user.username === newUser.username;
        }) === undefined
      ) {
        await this.dialogueService.joinDialogue({
          user: newUser,
          dialogue: dialogue,
        });
      } else {
        console.log(newUser.username, 'already in dialogue');
      }
    }
    return {
      message: 'Users addded',
      users: usernames,
    };
  }
}
