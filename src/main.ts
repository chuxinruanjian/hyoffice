import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // 允许所有来源（如果是 true，NestJS 会自动映射当前请求的 origin）
    origin: true,
    // 允许携带 Cookie 或自定义请求头 (如 Authorization)
    credentials: true,
  });

  // 开启全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动过滤掉 DTO 中未定义的属性
      forbidNonWhitelisted: true, // 如果传来 DTO 之外的属性，直接报错
      transform: true, // 自动将参数转换为 DTO 类实例
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error('应用启动失败:', err);
  process.exit(1);
});
