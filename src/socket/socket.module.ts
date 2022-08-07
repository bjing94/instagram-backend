import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import AccountSocket from 'src/entities/account-socket.entity';
import { SocketService } from './socket.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AccountSocket])],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}
