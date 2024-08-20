import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalFileService } from 'src/local_file/local_file.service';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, LocalFileService, ConfigService],
  exports: [UserService]

})
export class UserModule {}
