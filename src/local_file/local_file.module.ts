import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LocalFileController } from './local_file.controller';
import { LocalFileService } from './local_file.service';

@Module({
  controllers: [LocalFileController],
  providers: [LocalFileService, PrismaService],
  exports: [LocalFileService]
})
export class LocalFileModule {}
