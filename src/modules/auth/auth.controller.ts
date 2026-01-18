import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   * POST /auth/login
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    // 获取客户端IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '';

    return this.authService.login(loginDto, clientIp);
  }

  /**
   * 获取当前登录用户信息
   * GET /auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  /**
   * 获取当前用户登录信息（最后登录时间、IP等）
   * GET /auth/login-info
   */
  @UseGuards(JwtAuthGuard)
  @Get('login-info')
  getLoginInfo(@CurrentUser('id') userId: number) {
    return this.authService.getLoginInfo(userId);
  }

  /**
   * 强制指定用户下线（管理员功能）
   * POST /auth/force-logout/:userId
   */
  @UseGuards(JwtAuthGuard)
  @Post('force-logout/:userId')
  forceLogout(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.forceLogout(userId);
  }

  /**
   * 退出登录（使当前用户的token失效）
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser('id') userId: number) {
    return this.authService.forceLogout(userId);
  }
}
