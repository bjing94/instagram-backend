import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import AccountSocket from 'src/entities/account-socket.entity';
import Account from 'src/entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(AccountSocket)
    private accSocketRepo: Repository<AccountSocket>,
  ) {}

  public server: Server = null;

  getJwtFromSocket(socket: Socket) {
    const token = socket.handshake.headers.authorization;
    if (!token) {
      return null;
    }
    let splitToken = token.split(' ');
    if (splitToken.length <= 1) {
      return null;
    }
    return splitToken[1];
  }

  async getSocketsFromUsernames(usernames: string[]) {
    let result = [];
    for (let username of usernames) {
      let entity = await this.accSocketRepo.findBy({
        user: { username: username },
      });
      if (!entity) {
        result.push(null);
      } else {
        result.push(...entity.map(({ clientId }) => clientId));
      }
    }
    return result;
  }

  async getOnlineConnections() {
    return this.accSocketRepo.findAndCountBy({});
  }

  async getOnlineUsers() {
    return this.accSocketRepo
      .createQueryBuilder('acc_socket')
      .select('acc_socket.user, COUNT(acc_socket.client_id)')
      .groupBy('acc_socket.user')
      .getRawMany();
  }

  async notifyUsers(usernames: string[], event: string, data: any) {
    let clientIds = await this.getSocketsFromUsernames(usernames);
    await this.notifyClients(clientIds, event, data);
  }

  async notifyClients(clientIds: string[], event: string, data: any) {
    for (let id of clientIds) {
      this.server.to(id).emit(event, data);
    }
  }

  async saveSocketClient(user: Account, clientId: string) {
    const entry = await this.accSocketRepo.create({
      user: user,
      clientId: clientId,
    });
    return this.accSocketRepo.save(entry);
  }

  async deleteSocketClient(clientId: string) {
    return this.accSocketRepo.delete({ clientId: clientId });
  }
}
