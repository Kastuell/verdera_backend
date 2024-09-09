import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { LocalFilesInterceptor } from 'src/local_file/localFile.interceptor';
import { UserUpdateDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth()
  async getById(@CurrentUser('id') id: string) {
    return this.userService.getById(Number(id));
  }

  @Get('by-email/:email')
  async getByEmail(@Param('email') email: string) {
    return this.userService.getByEmail(email);
  }

  @Get('check-email/:email')
  async checkEmail(@Param('email') email: string) {
    return this.userService.checkEmail(email);
  }

  @Put()
  @Auth()
  @UsePipes(new ValidationPipe())
  async update(@CurrentUser('id') id: string, @Body() dto: UserUpdateDto) {
    return this.userService.update(Number(id), dto);
  }

  @Post('avatar')
  @Auth()
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'file',
      path: '/avatars',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5242880,
      },
    }),
  )
  async addAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Please upload a file');
    return this.userService.addAvatar(Number(userId), {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  }

  
}
