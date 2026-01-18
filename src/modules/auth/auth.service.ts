import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: number; // 用户ID
  username: string;
  roles: string[];
  tokenVersion: number; // Token版本号，用于单点登录验证
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   * 实现单点登录：每次登录会使之前的token失效
   */
  async login(loginDto: LoginDto, clientIp?: string) {
    const { username, password } = loginDto;

    // 1. 查找用户及其角色
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { roles: true },
    });

    // 2. 校验用户是否存在
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 3. 校验密码
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 4. 更新tokenVersion（使旧token失效）和最后登录时间
    const newTokenVersion = user.tokenVersion + 1;
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: newTokenVersion,
        lastLoginAt: new Date(),
        lastLoginIp: clientIp || null,
      },
      include: { roles: true },
    });

    // 5. 生成 JWT Token（包含tokenVersion用于验证）
    const payload: JwtPayload = {
      sub: updatedUser.id,
      username: updatedUser.username,
      roles: updatedUser.roles.map((r) => r.name),
      tokenVersion: newTokenVersion,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        realName: updatedUser.realName,
        roles: updatedUser.roles,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    };
  }

  /**
   * 验证JWT payload中的tokenVersion是否有效
   * 用于单点登录：如果tokenVersion不匹配，说明用户在其他地方登录过
   */
  async validateTokenVersion(userId: number, tokenVersion: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true },
    });

    if (!user) {
      return false;
    }

    // 只有tokenVersion完全匹配才有效
    return user.tokenVersion === tokenVersion;
  }

  /**
   * 通过ID获取用户信息（用于JWT策略）
   */
  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
        department: true,
      },
    });
  }

  /**
   * 强制用户下线（使其token失效）
   */
  async forceLogout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });
    return { message: '用户已被强制下线' };
  }

  /**
   * 获取用户登录信息
   */
  async getLoginInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        realName: true,
        lastLoginAt: true,
        lastLoginIp: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }
}
