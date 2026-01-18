import { Module } from '@nestjs/common';
import { SiteConfigService } from './config.service';
import { SiteConfigController } from './config.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [SiteConfigController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
