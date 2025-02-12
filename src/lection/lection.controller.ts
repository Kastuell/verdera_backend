import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { LocalFilesInterceptor } from 'src/local_file/localFile.interceptor';
import { LectionDto } from './dto/lection.dto';
import { LectionService } from './lection.service';

@Controller('lection')
export class LectionController {
  constructor(private readonly lectionService: LectionService) {}

  @Get()
  @Auth('ADMIN')
  getAll() {
    return this.lectionService.getAll();
  }

  @Get(':id')
  @Auth('ADMIN')
  getById(@Param('id') id: string) {
    return this.lectionService.getById(Number(id));
  }

  @Post('/complete-lection/:slug')
  @Auth('STUDENT')
  createCompletedLection(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lectionService.createCompleteLection(slug, Number(userId));
  }

  @Auth('STUDENT')
  @Get('/by-slug/:slug')
  getBySlug(@CurrentUser('id') id: string, @Param('slug') slug: string) {
    return this.lectionService.getBySlug(slug, Number(id));
  }

  @Post()
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: LectionDto) {
    return this.lectionService.create(dto);
  }

  @Put(':id')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() dto: LectionDto) {
    return this.lectionService.update(Number(id), dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  delete(@Param('id') id: string) {
    return this.lectionService.delete(Number(id));
  }

  @Post('materials/:id')
  @Auth()
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'file',
      path: '/lections',
      fileFilter: (request, file, callback) => {
        // if (!file.mimetype.includes('file')) {
        //   return callback(new BadRequestException('Provide a valid image'), false);
        // }
        callback(null, true);
      },
    }),
  )
  async addMaterials(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Please upload a file');
    return this.lectionService.addMaterials(Number(id), {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  }
}
