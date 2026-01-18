import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ConfigItem {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class BatchUpdateConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigItem)
  configs: ConfigItem[];
}
