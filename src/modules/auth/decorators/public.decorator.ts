import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开接口装饰器 - 标记不需要登录验证的接口
 * 
 * 使用示例:
 * @Public()
 * @Get('public-data')
 * getPublicData() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
