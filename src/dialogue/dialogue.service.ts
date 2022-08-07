import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import AccountDialogue from 'src/entities/account-dialogue.entity';
import Account from 'src/entities/account.entity';
import Dialogue from 'src/entities/dialogue.entity';
import Message from 'src/entities/message.entity';
import { DeepPartial, Repository } from 'typeorm';
import CreateMessageDto from './dto/create-message.dto';
import LeaveDialogueDto from './dto/leave-dialogue.dto';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import compareStringArray from 'src/helpers/compareStringArray';
import { SocketService } from 'src/socket/socket.service';
import { format } from 'date-fns';
import JoinDialogueDto from './dto/join-dialogue.dto';

@Injectable()
export class DialogueService {
  constructor(
    @InjectRepository(Dialogue)
    private readonly dialogueRepo: Repository<Dialogue>,
    @InjectRepository(AccountDialogue)
    private readonly accountDialogueRepo: Repository<AccountDialogue>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
  ) {}

  async create(owner: Account, users: Account[]) {
    let dialogue = await this.dialogueRepo.save({ owner: owner });
    for (let user of users) {
      await this.accountDialogueRepo.save({
        user: user,
        dialogue: dialogue,
        active: true,
      });
    }
    return dialogue;
  }

  async get(dialogueId: string) {
    let result = await this.dialogueRepo
      .createQueryBuilder('dialogue')
      .leftJoinAndSelect('dialogue.owner', 'account')
      .where('dialogue.id = :id', {
        id: dialogueId,
      })
      .getOne();

    result.messages = await this.getMessages(dialogueId);
    return result;
  }

  async getMessagesUntilDate(dialogueId: string, date: Date) {
    const result = await this.dialogueRepo
      .createQueryBuilder('dialogue')
      .leftJoinAndSelect('dialogue.messages', 'message')
      .leftJoinAndSelect('message.user', 'account')
      .where('dialogue.id = :id AND message.created_at < :date', {
        id: dialogueId,
        date: format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      })
      .getOne();
    if (!result) return [];
    return result.messages;
  }
  async getMessages(dialogueId: string) {
    const result = await this.dialogueRepo
      .createQueryBuilder('dialogue')
      .leftJoinAndSelect('dialogue.messages', 'message')
      .leftJoinAndSelect('message.user', 'account')
      .where('dialogue.id = :id', {
        id: dialogueId,
      })
      .orderBy('message.created_at', 'ASC')
      .getOne();
    if (!result) return [];
    return result.messages;
  }
  async getUserDialogues(userId: string) {
    let userDialogues = await this.accountDialogueRepo
      .createQueryBuilder('acc_d')
      .leftJoinAndSelect('acc_d.dialogue', 'dialogue')
      .leftJoinAndSelect('acc_d.lastVisibleMessage', 'message')
      .leftJoinAndSelect('message.user', 'account')
      .where('acc_d.user = :user_id', { user_id: userId })
      .getMany();
    return userDialogues;
  }

  async delete(dialogueId: string) {
    return this.dialogueRepo.delete({ id: dialogueId });
  }

  async addMessage(dto: CreateMessageDto) {
    let result = await this.messageRepo.save(dto);

    // initiate account to dialogue table
    await this.accountDialogueRepo
      .createQueryBuilder('account_dialogue')
      .update(AccountDialogue)
      .set({
        firstMessage: result,
        lastVisibleMessage: result,
        firstVisibleMessage: result,
      })
      .where(
        'account_dialogue.first_msg_id IS NULL AND account_dialogue.dialogue_id = :id AND account_dialogue.active = true',
        {
          id: dto.dialogue.id,
        },
      )
      .execute();

    // update account to dialogue table
    await this.accountDialogueRepo
      .createQueryBuilder('account_dialogue')
      .update(AccountDialogue)
      .set({
        lastVisibleMessage: result,
      })
      .where(
        `account_dialogue.last_visible_msg_id IS NOT NULL 
		AND account_dialogue.dialogue_id = :id
		AND account_dialogue.active = true`,
        {
          id: dto.dialogue.id,
        },
      )
      .execute();

    // notify users
    let users = await this.getUsersInDialogue(dto.dialogue.id);
    let usernames = users.map((user) => user.username);
    await this.socketService.notifyUsers(usernames, 'message', {
      dialogue: {
        id: dto.dialogue.id,
        title: dto.dialogue.title,
      },
      message: result,
    });
    return result;
  }

  async joinDialogue(dto: JoinDialogueDto) {
    let record = await this.accountDialogueRepo.findOneBy({
      user: { id: dto.user.id },
      dialogue: { id: dto.dialogue.id },
      active: false,
    });
    if (!record) {
      await this.accountDialogueRepo.save({
        ...dto,
        active: true,
      });
    } else {
      await this.accountDialogueRepo.update(
        {
          user: { id: dto.user.id },
          dialogue: { id: dto.dialogue.id },
          active: false,
        },
        {
          active: true,
        },
      );
      const joinMessage: CreateMessageDto = {
        body: `${dto.user.username} joined dialogue`,
        user: dto.user,
        dialogue: dto.dialogue,
        type: 'event',
      };
      await this.addMessage(joinMessage);
    }
  }
  async leaveDialogue(dto: LeaveDialogueDto) {
    let result = await this.accountDialogueRepo.update(
      { user: { id: dto.userId }, dialogue: { id: dto.dialogueId } },
      { active: false },
    );

    return result;
  }

  async getUsersInDialogue(dialogueId: string) {
    const query = await this.accountDialogueRepo
      .createQueryBuilder('acc_dial')
      .innerJoinAndSelect('acc_dial.user', 'account')
      .where('acc_dial.dialogue = :id', { id: dialogueId })
      .andWhere('acc_dial.active = true')
      .getMany();
    return query.map((item) => item.user);
  }

  async getMessagesFromDialogue(dialogueId: string) {
    const query = await this.dialogueRepo
      .createQueryBuilder('dialogue')
      .leftJoinAndSelect('dialogue.messages', 'message')
      .innerJoinAndSelect('message.user', 'account')
      .select(['dialogue.id', 'message.body', 'account.username'])
      .where('dialogue.id = :id', { id: dialogueId })
      .getOne();
    return query.messages;
  }

  // Websocket implementation

  async isInDialogue(userId: string, dialogueId: string) {
    const result = await this.accountDialogueRepo.findOneBy({
      dialogue: { id: dialogueId },
      user: { id: userId },
      active: true,
    });
    if (!result) return false;
    return true;
  }

  async wasInDialogue(userId: string, dialogueId: string) {
    const result = await this.accountDialogueRepo.findOneBy({
      dialogue: { id: dialogueId },
      user: { id: userId },
      active: false,
    });
    if (!result) return false;
    return true;
  }

  async getLeaveDate(userId: string, dialogueId: string) {
    const result = await this.accountDialogueRepo.findOneBy({
      dialogue: { id: dialogueId },
      user: { id: userId },
      active: false,
    });
    if (!result) return null;
    return result.updated_at;
  }

  // Checks if there is a duplicate dialogue
  async hasDuplicate(usernames: string[]) {
    const query = await this.accountDialogueRepo
      .createQueryBuilder('acc_dial')
      .leftJoinAndSelect('acc_dial.dialogue', 'dialogue')
      .leftJoinAndSelect('acc_dial.user', 'account')
      .select(['acc_dial.id', 'account.username', 'dialogue.id'])
      .where('acc_dial.active = true')
      .getMany();

    let dialogueToUser = [];
    query.forEach((item) => {
      if (dialogueToUser[item.dialogue.id] === undefined) {
        dialogueToUser[item.dialogue.id] = [item.user.username];
      } else {
        dialogueToUser[item.dialogue.id].push(item.user.username);
      }
    });

    let foundDuplicate = false;
    for (let idx in dialogueToUser) {
      console.log(dialogueToUser[idx]);
      if (compareStringArray(dialogueToUser[idx], usernames)) {
        foundDuplicate = true;
        break;
      }
    }

    return foundDuplicate;
  }

  async createDialogue(
    creatorId: string,
    otherUsernames: string[],
    category: string,
    title: string,
  ) {
    let owner = await this.userService.get(creatorId);
    if (!owner) {
      throw new WsException('owner not found');
    }
    let dialogue = await this.dialogueRepo.save({
      owner: owner,
      category: category,
      title: title,
    });
    if (!dialogue) {
      throw new WsException('dialogue was not created');
    }
    let users = await this.userService.getUsersByUsername(otherUsernames);
    users.push(owner);
    console.log(otherUsernames, 'got users', users);
    const entities = users.map((user): DeepPartial<AccountDialogue> => {
      return {
        user: user,
        dialogue: dialogue,
        active: true,
      };
    });
    await this.accountDialogueRepo.save(entities);
    return dialogue;
  }
}
