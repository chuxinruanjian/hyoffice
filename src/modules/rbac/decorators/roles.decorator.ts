import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器 - 用于标记需要特定角色才能访问的路由
 * @param roles 角色名称列表，用户只需拥有其中任一角色即可访问
 * 
 * 使用示例:
 * @Roles('admin', 'manager')
 * @Get('admin-only')
 * adminOnlyEndpoint() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
