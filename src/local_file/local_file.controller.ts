import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { LocalFileService } from './local_file.service';

@Controller('local-file')
export class LocalFileController {
  constructor(private readonly localFileService: LocalFileService) {}

  @Auth()
  @Get(':id')
  async getDatabaseFileById(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.localFileService.getFileById(id);

    if (Number(userId) !== file.user.id) {
      throw new BadRequestException('Это чужая аватарка!')
    }

    const stream = createReadStream(join(process.cwd(), file.path));

    response.set({
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Type': file.mimetype,
    });
    return new StreamableFile(stream);
  }

  @Get('/lection/:id')
  async getDatabaseLectionsFileById(
    @Body() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.localFileService.getFileById(id);

    console.log(userId)

    const stream = createReadStream(join(process.cwd(), file.path));

    response.set({
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Type': file.mimetype,
    });
    return new StreamableFile(stream);
  }
}
