import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LocalFileDto } from './dto/localFile.dto';

@Injectable()
export class LocalFileService {
  constructor(private prisma: PrismaService) {}

  async saveLocalFileData(dto: LocalFileDto) {
    const newFile = await this.prisma.localFile.create({
      data: {
        ...dto,
      },
    });

    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.prisma.localFile.findUnique({
      where: {
        id: fileId,
      },
      select: {
        filename: true,
        id: true,
        mimetype: true,
        path: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }
}
