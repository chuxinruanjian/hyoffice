import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置权限要求，则允许访问
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('用户未认证');
    }

    // 获取用户的所有权限
    const userPermissions = await this.rbacService.getUserRolesAndPermissions(
      user.id,
    );
    const userPermissionCodes = userPermissions.permissions.map((p) => p.code);

    // 检查用户是否拥有所需的任一权限
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissionCodes.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('您没有访问此资源的权限');
    }

    return true;
  }
}
