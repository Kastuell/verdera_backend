import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, ...response } =
      await this.authService.login(dto);
    this.authService.addTokensToResponse(res, refreshToken, accessToken);

    return response;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(
    @Body() dto: AuthRegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, ...response } =
      await this.authService.register(dto);
    this.authService.addTokensToResponse(res, refreshToken, accessToken);

    return response;
  }

  @HttpCode(200)
  @Post('login/access-token')
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookies =
      req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeTokensFromResponse(res);
      throw new UnauthorizedException('Refresh token not passed');
    }

    const { refreshToken, accessToken, ...response } =
      await this.authService.getNewTokens(refreshTokenFromCookies);

    this.authService.addTokensToResponse(res, refreshToken, accessToken);

    return response;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeTokensFromResponse(res);
    return true;
  }
}
