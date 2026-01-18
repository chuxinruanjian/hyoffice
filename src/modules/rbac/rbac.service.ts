import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  // ==================== 角色管理 ====================

  /**
   * 创建角色
   */
  async createRole(createRoleDto: CreateRoleDto) {
    const { name, description, permissionIds } = createRoleDto;

    // 检查角色名是否已存在
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(`角色名 "${name}" 已存在`);
    }

    return this.prisma.role.create({
      data: {
        name,
        description,
        permissions: permissionIds
          ? {
              connect: permissionIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });
  }

  /**
   * 获取所有角色
   */
  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
    });
  }

  /**
   * 根据ID获取角色
   */
  async findRoleById(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 更新角色
   */
  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findRoleById(id);

    const { name, description, permissionIds } = updateRoleDto;

    // 如果更新名称，检查是否与其他角色冲突
    if (name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existingRole) {
        throw new ConflictException(`角色名 "${name}" 已存在`);
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: permissionIds
          ? {
              set: permissionIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });
  }

  /**
   * 删除角色
   */
  async removeRole(id: number) {
    await this.findRoleById(id);

    return this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * 为角色分配权限
   */
  async assignPermissionsToRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ) {
    await this.findRoleById(roleId);

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: assignPermissionsDto.permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  // ==================== 权限管理 ====================

  /**
   * 创建权限
   */
  async createPermission(createPermissionDto: CreatePermissionDto) {
    const { name, code } = createPermissionDto;

    // 检查权限名或权限码是否已存在
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existingPermission) {
      throw new ConflictException(`权限名 "${name}" 或权限码 "${code}" 已存在`);
    }

    return this.prisma.permission.create({
      data: {
        name,
        code,
      },
    });
  }

  /**
   * 获取所有权限
   */
  async findAllPermissions() {
    return this.prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });
  }

  /**
   * 根据ID获取权限
   */
  async findPermissionById(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`权限 ID ${id} 不存在`);
    }

    return permission;
  }

  /**
   * 更新权限
   */
  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.findPermissionById(id);

    const { name, code } = updatePermissionDto;

    // 检查是否与其他权限冲突
    if (name || code) {
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          OR: [name ? { name } : {}, code ? { code } : {}].filter(
            (obj) => Object.keys(obj).length > 0,
          ),
          NOT: { id },
        },
      });

      if (existingPermission) {
        throw new ConflictException(`权限名或权限码已存在`);
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        name,
        code,
      },
    });
  }

  /**
   * 删除权限
   */
  async removePermission(id: number) {
    await this.findPermissionById(id);

    return this.prisma.permission.delete({
      where: { id },
    });
  }

  /**
   * 批量创建权限
   */
  async createPermissionsBatch(permissions: CreatePermissionDto[]) {
    return this.prisma.permission.createMany({
      data: permissions,
      skipDuplicates: true,
    });
  }

  // ==================== 用户角色管理 ====================

  /**
   * 为用户分配角色
   */
  async assignRolesToUser(userId: number, assignRolesDto: AssignRolesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${userId} 不存在`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: assignRolesDto.roleIds.map((id) => ({ id })),
        },
      },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  /**
   * 获取用户的角色和权限
   */
  async getUserRolesAndPermissions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${userId} 不存在`);
    }

    // 整合用户的所有权限（去重）
    const permissionsMap = new Map<number, { id: number; name: string; code: string }>();
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissionsMap.set(permission.id, permission);
      });
    });

    return {
      userId: user.id,
      username: user.username,
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
      permissions: Array.from(permissionsMap.values()),
    };
  }

  /**
   * 检查用户是否有指定权限
   */
  async checkUserPermission(userId: number, permissionCode: string): Promise<boolean> {
    const userPermissions = await this.getUserRolesAndPermissions(userId);
    return userPermissions.permissions.some((p) => p.code === permissionCode);
  }

  /**
   * 检查用户是否有指定角色
   */
  async checkUserRole(userId: number, roleName: string): Promise<boolean> {
    const userPermissions = await this.getUserRolesAndPermissions(userId);
    return userPermissions.roles.some((r) => r.name === roleName);
  }
}
