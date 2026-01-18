import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限装饰器 - 用于标记需要特定权限才能访问的路由
 * @param permissions 权限编码列表，用户只需拥有其中任一权限即可访问
 * 
 * 使用示例:
 * @Permissions('user:create', 'user:update')
 * @Post()
 * createUser() { ... }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
