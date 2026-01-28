import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录用户装饰器
 *
 * 使用示例:
 * @Get('profile')
 * getProfile(@CurrentUser() user: any) {
 *   return user;
 * }
 *
 * // 获取用户的特定字段
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: number) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果指定了字段名，返回特定字段
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
