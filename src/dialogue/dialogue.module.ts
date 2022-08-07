import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import AccountDialogue from 'src/entities/account-dialogue.entity';
import Dialogue from 'src/entities/dialogue.entity';
import Message from 'src/entities/message.entity';
import { UserModule } from 'src/user/user.module';
import DialogueController from './dialogue.controller';
import { DialogueGateway } from './dialogue.gateway';
import { DialogueService } from './dialogue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialogue, AccountDialogue, Message]),
    AuthModule,
    UserModule,
  ],
  providers: [DialogueService],
  exports: [DialogueService],
  controllers: [DialogueController],
})
export class DialogueModule {}
