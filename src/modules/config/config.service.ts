import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { BatchUpdateConfigDto } from './dto/batch-update-config.dto';

// 私密分组前缀列表（这些分组在公开接口中不可见）
const PRIVATE_GROUP_PREFIXES = ['secret', 'private', 'credential'];

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * 判断分组是否为私密分组
   */
  private isPrivateGroup(group: string): boolean {
    const lowerGroup = group.toLowerCase();
    return PRIVATE_GROUP_PREFIXES.some((prefix) =>
      lowerGroup.startsWith(prefix),
    );
  }

  /**
   * 创建配置项
   */
  async create(createConfigDto: CreateConfigDto) {
    const existing = await this.prisma.siteConfig.findUnique({
      where: { key: createConfigDto.key },
    });

    if (existing) {
      throw new ConflictException(`配置项 "${createConfigDto.key}" 已存在`);
    }

    return this.prisma.siteConfig.create({
      data: createConfigDto,
    });
  }

  /**
   * 获取所有配置项（包含私密分组，需要权限）
   */
  async findAll(group?: string) {
    const where = group ? { group } : {};
    return this.prisma.siteConfig.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  /**
   * 获取所有公开配置项（排除私密分组）
   */
  async findAllPublic(group?: string) {
    // 如果指定的分组是私密的，返回空数组
    if (group && this.isPrivateGroup(group)) {
      return [];
    }

    // 获取所有配置
    const configs = await this.prisma.siteConfig.findMany({
      where: group ? { group } : undefined,
      orderBy: { key: 'asc' },
    });

    // 过滤掉私密分组的配置
    return configs.filter((config) => !this.isPrivateGroup(config.group));
  }

  /**
   * 获取所有配置项（键值对格式，包含私密分组，需要权限）
   */
  async findAllAsMap(group?: string) {
    const configs = await this.findAll(group);
    const result: Record<string, string> = {};
    configs.forEach((config) => {
      result[config.key] = config.value;
    });
    return result;
  }

  /**
   * 获取所有公开配置项（键值对格式，排除私密分组）
   */
  async findAllPublicAsMap(group?: string) {
    const configs = await this.findAllPublic(group);
    const result: Record<string, string> = {};
    configs.forEach((config) => {
      result[config.key] = config.value;
    });
    return result;
  }

  /**
   * 根据 key 获取单个配置（需要权限）
   */
  async findByKey(key: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`配置项 "${key}" 不存在`);
    }

    return config;
  }

  /**
   * 根据 key 获取单个公开配置（排除私密分组）
   */
  async findPublicByKey(key: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`配置项 "${key}" 不存在`);
    }

    // 如果是私密分组的配置，拒绝访问
    if (this.isPrivateGroup(config.group)) {
      throw new ForbiddenException('无权访问此配置项');
    }

    return config;
  }

  /**
   * 获取单个配置的值
   */
  async getValue(key: string, defaultValue?: string): Promise<string> {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });

    return config?.value ?? defaultValue ?? '';
  }

  /**
   * 根据 ID 获取配置（需要权限）
   */
  async findById(id: number) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`配置项 ID ${id} 不存在`);
    }

    return config;
  }

  /**
   * 根据 ID 获取公开配置（排除私密分组）
   */
  async findPublicById(id: number) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`配置项 ID ${id} 不存在`);
    }

    // 如果是私密分组的配置，拒绝访问
    if (this.isPrivateGroup(config.group)) {
      throw new ForbiddenException('无权访问此配置项');
    }

    return config;
  }

  /**
   * 更新配置项（按 ID）
   */
  async update(id: number, updateConfigDto: UpdateConfigDto) {
    await this.findById(id);

    return this.prisma.siteConfig.update({
      where: { id },
      data: updateConfigDto,
    });
  }

  /**
   * 更新配置项（按 key）
   */
  async updateByKey(key: string, updateConfigDto: UpdateConfigDto) {
    await this.findByKey(key);

    return this.prisma.siteConfig.update({
      where: { key },
      data: updateConfigDto,
    });
  }

  /**
   * 设置配置值（按 key，不存在则创建）
   */
  async set(key: string, value: string, description?: string, group?: string) {
    return this.prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        description,
        group: group || 'general',
      },
    });
  }

  /**
   * 批量更新配置
   */
  async batchUpdate(batchUpdateDto: BatchUpdateConfigDto) {
    const results = await Promise.all(
      batchUpdateDto.configs.map((item) =>
        this.prisma.siteConfig.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: {
            key: item.key,
            value: item.value,
          },
        }),
      ),
    );

    return results;
  }

  /**
   * 删除配置项
   */
  async remove(id: number) {
    await this.findById(id);

    return this.prisma.siteConfig.delete({
      where: { id },
    });
  }

  /**
   * 按 key 删除配置项
   */
  async removeByKey(key: string) {
    await this.findByKey(key);

    return this.prisma.siteConfig.delete({
      where: { key },
    });
  }

  /**
   * 获取所有配置分组（包含私密分组，需要权限）
   */
  async getGroups() {
    const configs = await this.prisma.siteConfig.findMany({
      select: { group: true },
      distinct: ['group'],
    });

    return configs.map((c) => c.group);
  }

  /**
   * 获取所有公开配置分组（排除私密分组）
   */
  async getPublicGroups() {
    const configs = await this.prisma.siteConfig.findMany({
      select: { group: true },
      distinct: ['group'],
    });

    return configs
      .map((c) => c.group)
      .filter((group) => !this.isPrivateGroup(group));
  }
}
