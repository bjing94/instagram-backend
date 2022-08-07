import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { DialogueService } from './dialogue.service';
import CreateDialogueDto from './dto/create-dialogue.dto';
import LeaveDialogueDto from './dto/leave-dialogue.dto';
import InDialogueGuard from './guards/in-dialogue.guard';
import IsDialogueOwnerGuard from './guards/is-dialogue-owner.guard';
import JwtSocketGuard from './guards/jwt-socket.guard';

// message - on message added
// sendMessage - add message to dialogue
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DialogueGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly dialogueService: DialogueService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // async notifyAllUsersInDialogue(
  //   dialogueId: string,
  //   event: string,
  //   data: any,
  // ) {}

  // @UseGuards(JwtSocketGuard)
  // @SubscribeMessage('createDialogue')
  // async createDialogue(
  //   @MessageBody() dto: CreateDialogueDto,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const user = await this.authService.getUserFromSocket(client);
  //   let hasDuplicates = await this.dialogueService.hasDuplicate([
  //     ...dto.otherUsernames,
  //     user.username,
  //   ]);
  //   if (hasDuplicates) {
  //     return null;
  //   }
  //   const { otherUsernames } = dto;
  //   let dialogueCategory = otherUsernames.length === 1 ? 'dialogue' : 'chat';
  //   let title = dto.title ?? null;

  //   let dialogue = await this.dialogueService.createDialogue(
  //     user.id,
  //     otherUsernames,
  //     dialogueCategory,
  //     title,
  //   );

  //   let clientIds = await this.authService.getSocketsFromUsernames(
  //     otherUsernames,
  //   );
  //   this.server.to(clientIds).emit('dialogueCreated', {
  //     message: 'Dialogue was created',
  //     dialogueId: dialogue.id,
  //     users: [...otherUsernames, user.username],
  //   });
  //   return {
  //     message: 'Dialogue was created',
  //     dialogueId: dialogue.id,
  //     users: [...otherUsernames, user.username],
  //   };
  // }

  // @UseGuards(JwtSocketGuard)
  // @SubscribeMessage('getDialogues')
  // async getUserDialogues(@ConnectedSocket() client: Socket) {
  //   let user = await this.authService.getUserFromSocket(client);
  //   let result = await this.dialogueService.getUserDialogues(user.id);
  //   console.log(user, result);
  //   for (let item of result) {
  //     let users = await this.dialogueService.getUsersInDialogue(
  //       item.dialogue.id,
  //     );
  //     item['users'] = users.map((accDialogue) => accDialogue.user.username);
  //   }
  //   return result.map((item: any) => {
  //     return {
  //       active: item.active,
  //       dialogueId: item.dialogue.id,
  //       users: item.users,
  //       lastMessage: item.lastVisibleMessage
  //         ? {
  //             body: item.lastVisibleMessage.body,
  //             user: item.lastVisibleMessage.user.username,
  //             createdAt: item.lastVisibleMessage.created_at,
  //           }
  //         : null,
  //     };
  //   });
  // }

  // @UseGuards(JwtSocketGuard, InDialogueGuard)
  // @SubscribeMessage('getDialogue')
  // async getDialogue(
  //   @MessageBody()
  //   dto: {
  //     dialogueId: string;
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const { dialogueId } = dto;
  //   let user = await this.authService.getUserFromSocket(client);
  //   let dialogue = await this.dialogueService.get(dialogueId);
  //   if (!dialogue) {
  //     throw new WsException('not found');
  //   }
  //   let isInDialogue = await this.dialogueService.isInDialogue(
  //     user.id,
  //     dialogueId,
  //   );
  //   if (!isInDialogue) {
  //     throw new WsException('not found');
  //   }
  //   const result = await this.dialogueService.getMessagesFromDialogue(
  //     dialogueId,
  //   );
  //   return {
  //     message: 'Messages for dialogue',
  //     messages: result.map((msg) => {
  //       return {
  //         body: msg.body,
  //         user: msg.user.username,
  //       };
  //     }),
  //     dialogueId: dialogueId,
  //   };
  // }

  // @UseGuards(JwtSocketGuard)
  // @SubscribeMessage('getAvailableUsers')
  // async getAvailableUsers(@ConnectedSocket() client: Socket) {
  //   await this.authService.getUserFromSocket(client);
  //   let availableUsers = await this.userService.getAll();
  //   return {
  //     users: availableUsers.map((user) => {
  //       return {
  //         id: user.id,
  //         username: user.username,
  //       };
  //     }),
  //   };
  // }

  // @UseGuards(JwtSocketGuard, InDialogueGuard)
  // @SubscribeMessage('sendMessage')
  // async sendMessage(
  //   @MessageBody()
  //   dto: {
  //     dialogueId: string;
  //     body: string;
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const { dialogueId, body } = dto;

  //   let user = await this.authService.getUserFromSocket(client);
  //   let dialogue = await this.dialogueService.get(dialogueId);
  //   if (!dialogue) {
  //     throw new WsException('not found');
  //   }

  //   let isInDialogue = await this.dialogueService.isInDialogue(
  //     user.id,
  //     dialogueId,
  //   );
  //   if (!isInDialogue) {
  //     throw new WsException('not found');
  //   }

  //   await this.dialogueService.addMessage({
  //     body: body,
  //     user: user,
  //     dialogue: dialogue,
  //   });

  //   let usersInDialogue = await this.dialogueService.getUsersInDialogue(
  //     dialogueId,
  //   );
  //   let clientIds = await this.authService.getSocketsFromUsernames(
  //     usersInDialogue.map((item) => item.user.username),
  //   );
  //   clientIds = clientIds.filter((id) => id !== null);
  //   for (let id of clientIds) {
  //     this.server.to(id).emit('message', {
  //       message: 'Message was sent',
  //       body: body,
  //       user: user.username,
  //       dialogueId: dialogueId,
  //     });
  //   }

  //   return {
  //     message: 'Message was sent',
  //     body: body,
  //     user: user.username,
  //     dialogueId: dialogueId,
  //   };
  // }

  // @UseGuards(JwtSocketGuard, IsDialogueOwnerGuard)
  // @SubscribeMessage('deleteDialogue')
  // async deleteDialogue(
  //   @MessageBody()
  //   dto: {
  //     dialogueId: string;
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const { dialogueId } = dto;
  //   let dialogue = await this.dialogueService.get(dialogueId);
  //   if (!dialogue) {
  //     throw new WsException('Dialogue was not found!');
  //   }
  //   await this.dialogueService.delete(dialogueId);

  //   let usersInDialogue = await this.dialogueService.getUsersInDialogue(
  //     dialogueId,
  //   );
  //   let clientIds = await this.authService.getSocketsFromUsernames(
  //     usersInDialogue.map((item) => item.user.username),
  //   );
  //   clientIds = clientIds.filter((id) => id !== null);
  //   for (let id of clientIds) {
  //     this.server.to(id).emit('dialogueDeleted', {
  //       message: 'Dialogue deleted!',
  //       dialogueId: dialogueId,
  //     });
  //   }

  //   return {
  //     message: 'Dialogue deleted!',
  //     dialogueId: dialogueId,
  //   };
  // }

  // @UseGuards(JwtSocketGuard, InDialogueGuard)
  // @SubscribeMessage('leaveDialogue')
  // async leaveDialogue(
  //   @MessageBody() dto: LeaveDialogueDto,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const { dialogueId } = dto;
  //   let user = await this.authService.getUserFromSocket(client);
  //   await this.dialogueService.leaveDialogue({
  //     dialogueId: dialogueId,
  //     userId: user.id,
  //   });
  // }
}
