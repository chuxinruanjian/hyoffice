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

  // ==================== 公开接口（无需权限，自动排除私密分组） ====================

  /**
   * 获取所有公开配置项（列表格式，排除私密分组）
   * GET /config
   */
  @Public()
  @Get()
  findAllPublic(@Query('group') group?: string) {
    return this.configService.findAllPublic(group);
  }

  /**
   * 获取所有公开配置项（键值对格式，排除私密分组）
   * GET /config/map
   */
  @Public()
  @Get('map')
  findAllPublicAsMap(@Query('group') group?: string) {
    return this.configService.findAllPublicAsMap(group);
  }

  /**
   * 获取所有公开配置分组（排除私密分组）
   * GET /config/groups
   */
  @Public()
  @Get('groups')
  getPublicGroups() {
    return this.configService.getPublicGroups();
  }

  /**
   * 根据 key 获取单个公开配置（排除私密分组）
   * GET /config/key/:key
   */
  @Public()
  @Get('key/:key')
  findPublicByKey(@Param('key') key: string) {
    return this.configService.findPublicByKey(key);
  }

  /**
   * 根据 ID 获取单个公开配置（排除私密分组）
   * GET /config/:id
   */
  @Public()
  @Get(':id')
  findPublicById(@Param('id', ParseIntPipe) id: number) {
    return this.configService.findPublicById(id);
  }

  // ==================== 需要权限的接口（可访问所有配置，包括私密分组） ====================

  /**
   * 获取所有配置项（包含私密分组）
   * GET /config/admin/all
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:list')
  @Get('admin/all')
  findAll(@Query('group') group?: string) {
    return this.configService.findAll(group);
  }

  /**
   * 获取所有配置项（键值对格式，包含私密分组）
   * GET /config/admin/map
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:list')
  @Get('admin/map')
  findAllAsMap(@Query('group') group?: string) {
    return this.configService.findAllAsMap(group);
  }

  /**
   * 获取所有配置分组（包含私密分组）
   * GET /config/admin/groups
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:list')
  @Get('admin/groups')
  getGroups() {
    return this.configService.getGroups();
  }

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
