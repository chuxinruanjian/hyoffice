import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string; // 权限名称，如: 用户管理

  @IsString()
  code: string; // 权限编码，如: user:list, user:create
}
