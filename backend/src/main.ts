import { loadEnv, assertSecretsOrExit } from "./common/env.config";

// 必须在 NestFactory 之前加载，确保所有模块读到 .env
loadEnv();
assertSecretsOrExit();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { join } from "path";
import { ALLOWED_ORIGINS } from "./common/origins";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. 可信代理层数：让 req.ip 取 Nginx 追加的 X-Forwarded-For 末尾的真实 IP，
  //    客户端自行伪造的 X-Forwarded-For 会被忽略，无法绕过限流。
  //    TRUST_PROXY 默认 1（一层 Nginx），直连或转发层级不同时用环境变量覆盖。
  app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

  // 2. 安全响应头 + CSP（脚本只允许同源，图片/字体/样式允许 CDN）
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  // 3. CORS 白名单（与 OriginGuard 共用同一来源常量）
  app.enableCors({
    origin: ALLOWED_ORIGINS as unknown as boolean | string | string[],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, "..", "public"));

  // 全局校验：过滤未声明字段、拒绝未声明字段、自动类型转换
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("博客后台 API")
    .setDescription("文章、音乐、上传接口文档")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  (globalThis as { __openapi_document?: unknown }).__openapi_document =
    document;

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`后端运行在: http://localhost:${port}`);
  console.log(`API 文档:   http://localhost:${port}/docs.html`);
}
void bootstrap();
