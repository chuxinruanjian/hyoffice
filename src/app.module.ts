import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { SiteConfigModule } from './modules/config/config.module';
import { UploadModule } from './modules/upload/upload.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot(
      // 1. 静态文件服务 - uploads 目录 (/uploads)
      {
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/uploads',
        serveStaticOptions: {
          index: false,
        },
      },
      // 2. 静态文件服务 - public 目录 (/)
      {
        rootPath: join(process.cwd(), 'public'),
        exclude: ['/api/:path(.*)'],
        serveStaticOptions: {
          index: false,
        },
      },
    ),
    PrismaModule,
    UsersModule,
    AuthModule,
    RbacModule,
    SiteConfigModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
