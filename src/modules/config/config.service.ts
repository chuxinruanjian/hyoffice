import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { BatchUpdateConfigDto } from './dto/batch-update-config.dto';

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

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
   * 获取所有配置项
   */
  async findAll(group?: string) {
    const where = group ? { group } : {};
    return this.prisma.siteConfig.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  /**
   * 获取所有配置项（键值对格式，方便前端使用）
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
   * 根据 key 获取单个配置
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
   * 获取单个配置的值
   */
  async getValue(key: string, defaultValue?: string): Promise<string> {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });

    return config?.value ?? defaultValue ?? '';
  }

  /**
   * 根据 ID 获取配置
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
   * 获取所有配置分组
   */
  async getGroups() {
    const configs = await this.prisma.siteConfig.findMany({
      select: { group: true },
      distinct: ['group'],
    });

    return configs.map((c) => c.group);
  }
}
