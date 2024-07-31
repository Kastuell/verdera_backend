import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
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
}
