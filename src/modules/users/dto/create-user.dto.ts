import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  realName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号码格式不正确' })
  phone?: string;

  @IsString()
  @IsOptional()
  wechatOpenId?: string;

  @IsOptional()
  departmentId?: number;
}
