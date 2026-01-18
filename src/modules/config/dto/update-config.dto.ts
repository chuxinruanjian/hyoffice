import { IsString, IsOptional } from 'class-validator';

export class UpdateConfigDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  group?: string;
}
