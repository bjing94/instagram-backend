import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Img from 'src/entities/img.entity';
import { ImgService } from './img.service';

@Module({
  imports: [TypeOrmModule.forFeature([Img]), ConfigModule],
  providers: [ImgService],
  exports: [ImgService],
})
export class ImgModule {}
