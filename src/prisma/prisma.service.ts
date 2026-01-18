import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    const pool = new PrismaPg({
      connectionString: config.get<string>('DATABASE_URL'),
    });
    super({ adapter: pool });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
