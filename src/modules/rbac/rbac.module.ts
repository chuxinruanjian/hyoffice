import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';

@Module({
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService], // 导出RbacService供其他模块使用
})
export class RbacModule {}
