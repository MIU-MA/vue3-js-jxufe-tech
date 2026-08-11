import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("api-json")
  getApiJson() {
    const g = globalThis as { __openapi_document?: unknown };
    return g.__openapi_document;
  }

  /** 健康检查：供负载均衡 / 监控探活 */
  @Get("api/health")
  getHealth() {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
