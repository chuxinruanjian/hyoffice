import { IsString, IsOptional } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  group?: string;
}
