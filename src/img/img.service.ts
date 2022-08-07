import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Img from 'src/entities/img.entity';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import * as dateFns from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { ImagePropertiesInterface } from 'src/config/configuration.interface';
import { ensureDir, writeFile } from 'fs-extra';

@Injectable()
export class ImgService {
  constructor(
    @InjectRepository(Img)
    private readonly imgRepo: Repository<Img>,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async create(file: Express.Multer.File) {
    const fileExtension = file.originalname.split('.')[1];
    const newFileName = nanoid() + '.' + fileExtension;
    const dateString = dateFns.format(new Date(), 'MM-dd-yyyy');
    const imgFolder = (
      this.configService.get('images') as ImagePropertiesInterface
    ).folder;

    await ensureDir(`${imgFolder}/${dateString}`);
    await writeFile(`${imgFolder}/${dateString}/${newFileName}`, file.buffer);

    const src = `${dateString}/${newFileName}`;
    const result = await this.imgRepo.save({
      src: src,
      imgType: file.mimetype,
    });
    return result;
  }
}
