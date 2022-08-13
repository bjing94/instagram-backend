import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Account from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import RegisterAccountDto, { LoginAccountDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import JwtPayloadDto from './dto/jwt-payload';
import { UserService } from 'src/user/user.service';
import AccountSocket from 'src/entities/account-socket.entity';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(AccountSocket)
    private readonly accountSocketRepo: Repository<AccountSocket>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
  ) {}

  async create(dto: RegisterAccountDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 7);
    const result = {
      username: dto.username,

      passwordHash: hashedPassword,

      email: dto.email,
    };
    return this.accountRepo.save(result);
  }

  async validate(dto: LoginAccountDto) {
    const user = await this.accountRepo.findOneBy({ username: dto.username });
    console.log('Found user', user);

    if (user && bcrypt.compareSync(dto.password, user.passwordHash)) {
      return user;
    }

    return null;
  }

  async validateToken(token: string) {
    return this.jwtService.verifyAsync(token);
  }

  async login(user: Account) {
    const payload: JwtPayloadDto = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async find(id: string) {
    const user = await this.accountRepo.findOneBy({ id: id });
    if (user) {
      return user;
    }
    return null;
  }

  async getUserFromToken(token: string) {
    let user: JwtPayloadDto = null;
    try {
      user = await this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
    if (user && user.sub) {
      return this.userService.get(user.sub);
    }
    return null;
  }

  async getUserFromSocket(socket: Socket) {
    const jwtToken = socket.handshake.headers.authorization
      ? socket.handshake.headers.authorization.split(' ')[1]
      : null;
    if (!jwtToken) {
      throw new WsException('Unauthorized user');
    }
    const user = await this.getUserFromToken(jwtToken);
    if (!user) {
      throw new WsException('Unauthorized user');
    }
    return user;
  }

  async identifyUserBySocket(socket: Socket) {
    const token = this.socketService.getJwtFromSocket(socket);
    const user = await this.getUserFromToken(token);
    if (!user) {
      return null;
    }
    return this.socketService.saveSocketClient(user, socket.id);
  }

  async deidentifyUserBySocket(socket: Socket) {
    return this.socketService.deleteSocketClient(socket.id);
  }

  async getSocketsFromUsernames(usernames: string[]) {
    let result = [];
    for (let username of usernames) {
      let entity = await this.accountSocketRepo.findBy({
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
    return this.accountSocketRepo.findAndCountBy({});
  }

  async getOnlineUsers() {
    return this.accountSocketRepo
      .createQueryBuilder('acc_socket')
      .select('acc_socket.user, COUNT(acc_socket.client_id)')
      .groupBy('acc_socket.user')
      .getRawMany();
  }

  async clearConnections() {
    return this.accountSocketRepo.delete({});
  }
}
