import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ==================== 角色管理接口 ====================

  /**
   * 创建角色
   * POST /rbac/roles
   */
  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  /**
   * 获取所有角色
   * GET /rbac/roles
   */
  @Get('roles')
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  /**
   * 获取单个角色详情
   * GET /rbac/roles/:id
   */
  @Get('roles/:id')
  findRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findRoleById(id);
  }

  /**
   * 更新角色
   * PATCH /rbac/roles/:id
   */
  @Patch('roles/:id')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  /**
   * 删除角色
   * DELETE /rbac/roles/:id
   */
  @Delete('roles/:id')
  removeRole(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removeRole(id);
  }

  /**
   * 为角色分配权限
   * POST /rbac/roles/:id/permissions
   */
  @Post('roles/:id/permissions')
  assignPermissionsToRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rbacService.assignPermissionsToRole(id, assignPermissionsDto);
  }

  // ==================== 权限管理接口 ====================

  /**
   * 创建权限
   * POST /rbac/permissions
   */
  @Post('permissions')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  /**
   * 批量创建权限
   * POST /rbac/permissions/batch
   */
  @Post('permissions/batch')
  createPermissionsBatch(@Body() permissions: CreatePermissionDto[]) {
    return this.rbacService.createPermissionsBatch(permissions);
  }

  /**
   * 获取所有权限
   * GET /rbac/permissions
   */
  @Get('permissions')
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  /**
   * 获取单个权限详情
   * GET /rbac/permissions/:id
   */
  @Get('permissions/:id')
  findPermissionById(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findPermissionById(id);
  }

  /**
   * 更新权限
   * PATCH /rbac/permissions/:id
   */
  @Patch('permissions/:id')
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(id, updatePermissionDto);
  }

  /**
   * 删除权限
   * DELETE /rbac/permissions/:id
   */
  @Delete('permissions/:id')
  removePermission(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removePermission(id);
  }

  // ==================== 用户角色管理接口 ====================

  /**
   * 为用户分配角色
   * POST /rbac/users/:userId/roles
   */
  @Post('users/:userId/roles')
  assignRolesToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.rbacService.assignRolesToUser(userId, assignRolesDto);
  }

  /**
   * 获取用户的角色和权限
   * GET /rbac/users/:userId/permissions
   */
  @Get('users/:userId/permissions')
  getUserRolesAndPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.rbacService.getUserRolesAndPermissions(userId);
  }

  /**
   * 检查用户是否拥有指定权限
   * GET /rbac/users/:userId/check-permission/:permissionCode
   */
  @Get('users/:userId/check-permission/:permissionCode')
  checkUserPermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('permissionCode') permissionCode: string,
  ) {
    return this.rbacService.checkUserPermission(userId, permissionCode);
  }

  /**
   * 检查用户是否拥有指定角色
   * GET /rbac/users/:userId/check-role/:roleName
   */
  @Get('users/:userId/check-role/:roleName')
  checkUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleName') roleName: string,
  ) {
    return this.rbacService.checkUserRole(userId, roleName);
  }
}
