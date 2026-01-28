import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET环境变量未配置');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * JWT验证回调
   * 验证token中的tokenVersion是否与数据库中的一致（单点登录验证）
   */
  async validate(payload: JwtPayload) {
    const { sub: userId, tokenVersion } = payload;

    // 验证tokenVersion是否有效（单点登录核心逻辑）
    const isValid = await this.authService.validateTokenVersion(
      userId,
      tokenVersion,
    );

    if (!isValid) {
      throw new UnauthorizedException('您的登录已失效，请重新登录');
    }

    // 获取完整的用户信息
    const user = await this.authService.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回的对象会被注入到 request.user
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      department: user.department,
    };
  }
}
