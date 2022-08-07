import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Account from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import CreateUserDto from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 7);
    const result = {
      username: dto.username,

      passwordHash: hashedPassword,

      email: dto.email,
    };
    return this.accountRepo.save(result);
  }

  async validate(dto: { username: string; password: string }) {
    const user = await this.accountRepo.findOneBy({ username: dto.username });
    console.log('Found user', user);

    if (user && bcrypt.compareSync(dto.password, user.passwordHash)) {
      return user;
    }

    return null;
  }

  async get(id: string) {
    const user = await this.accountRepo.findOneBy({ id: id });
    if (user) {
      return user;
    }
    return null;
  }

  async getAll() {
    return this.accountRepo.find({});
  }

  async getUserByUsername(username: string) {
    return this.accountRepo.findOneBy({ username: username });
  }

  async getUsersByUsername(usernames: string[]) {
    return this.accountRepo
      .createQueryBuilder('user')
      .where('user.username IN (:...usernames)', { usernames: usernames })
      .getMany();
  }

  async validateUsersByUsernames(usernames: string[]) {
    let users = await this.getUsersByUsername(usernames);
    if (users.length !== usernames.length) return false;
    return true;
  }
}
