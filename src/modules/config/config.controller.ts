import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SiteConfigService } from './config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { BatchUpdateConfigDto } from './dto/batch-update-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@Controller('config')
export class SiteConfigController {
  constructor(private readonly configService: SiteConfigService) {}

  // ==================== 公开接口（无需权限） ====================

  /**
   * 获取所有配置项（列表格式）
   * GET /config
   */
  @Public()
  @Get()
  findAll(@Query('group') group?: string) {
    return this.configService.findAll(group);
  }

  /**
   * 获取所有配置项（键值对格式，方便前端使用）
   * GET /config/map
   */
  @Public()
  @Get('map')
  findAllAsMap(@Query('group') group?: string) {
    return this.configService.findAllAsMap(group);
  }

  /**
   * 获取所有配置分组
   * GET /config/groups
   */
  @Public()
  @Get('groups')
  getGroups() {
    return this.configService.getGroups();
  }

  /**
   * 根据 key 获取单个配置
   * GET /config/key/:key
   */
  @Public()
  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.configService.findByKey(key);
  }

  /**
   * 根据 ID 获取单个配置
   * GET /config/:id
   */
  @Public()
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.configService.findById(id);
  }

  // ==================== 需要权限的接口 ====================

  /**
   * 创建配置项
   * POST /config
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:create')
  @Post()
  create(@Body() createConfigDto: CreateConfigDto) {
    return this.configService.create(createConfigDto);
  }

  /**
   * 批量更新配置
   * POST /config/batch
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:update')
  @Post('batch')
  batchUpdate(@Body() batchUpdateDto: BatchUpdateConfigDto) {
    return this.configService.batchUpdate(batchUpdateDto);
  }

  /**
   * 更新配置项（按 ID）
   * PATCH /config/:id
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:update')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConfigDto: UpdateConfigDto,
  ) {
    return this.configService.update(id, updateConfigDto);
  }

  /**
   * 更新配置项（按 key）
   * PATCH /config/key/:key
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:update')
  @Patch('key/:key')
  updateByKey(
    @Param('key') key: string,
    @Body() updateConfigDto: UpdateConfigDto,
  ) {
    return this.configService.updateByKey(key, updateConfigDto);
  }

  /**
   * 删除配置项（按 ID）
   * DELETE /config/:id
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.configService.remove(id);
  }

  /**
   * 删除配置项（按 key）
   * DELETE /config/key/:key
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:delete')
  @Delete('key/:key')
  removeByKey(@Param('key') key: string) {
    return this.configService.removeByKey(key);
  }
}
