import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabasePropertiesInterface } from './config/configuration.interface';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ImgModule } from './img/img.module';
import { CommentsModule } from './comments/comments.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { UserModule } from './user/user.module';
import { DialogueModule } from './dialogue/dialogue.module';
import { SocketModule } from './socket/socket.module';
import { AppGateway } from './app.gateway';
import Account from './entities/account.entity';
import Post from './entities/post.entity';
import Img from './entities/img.entity';
import PostImg from './entities/post-img.entity';
import Likes from './entities/like.entity';
import Comments from './entities/comment.entity';
import Bookmark from './entities/bookmark.entity';
import Message from './entities/message.entity';
import AccountDialogue from './entities/account-dialogue.entity';
import Dialogue from './entities/dialogue.entity';
import AccountSocket from './entities/account-socket.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const db: DatabasePropertiesInterface = configService.get('database');
        return {
          type: db.type as 'postgres',
          host: db.host,
          port: db.port,
          database: db.name,
          username: db.user,
          password: db.password,
          entities: [
            Account,
            Post,
            Img,
            PostImg,
            Likes,
            Comments,
            Bookmark,
            Message,
            AccountDialogue,
            AccountSocket,
            Dialogue,
          ],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    PostModule,
    ImgModule,
    CommentsModule,
    BookmarkModule,
    UserModule,
    DialogueModule,
    SocketModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
