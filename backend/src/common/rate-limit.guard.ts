import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import type { Request } from 'express';

interface RateEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  /** 窗口内允许的最大请求数 */
  limit: number;
  /** 窗口时长（毫秒） */
  ttlMs: number;
  /** 自定义限流 key（默认使用 req.ip） */
  keyBy?: (req: Request) => string;
}

export const RATE_LIMIT_META = 'rate_limit_config';

/**
 * 在路由上声明限流规则，并挂载 RateLimitGuard。
 * 例：@RateLimit({ limit: 5, ttlMs: 600_000 })
 */
export function RateLimit(config: RateLimitConfig) {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_META, config),
    UseGuards(RateLimitGuard),
  );
}

/**
 * 内存固定窗口限流器。
 * 单实例部署够用；多实例部署时替换为 Redis 实现（key 含 ip，天然可分布式）。
 */
@Injectable()
export class RateLimiterService {
  private readonly hits = new Map<string, RateEntry>();
  private readonly MAX_ENTRIES = 10_000;

  check(key: string, limit: number, ttlMs: number): boolean {
    const now = Date.now();
    let entry = this.hits.get(key);

    if (!entry || now > entry.resetAt) {
      // 惰性清理：命中时顺带清理过期项，防止内存无限增长
      if (this.hits.size >= this.MAX_ENTRIES) {
        for (const [k, e] of this.hits) {
          if (now > e.resetAt) this.hits.delete(k);
        }
        if (this.hits.size >= this.MAX_ENTRIES) {
          // 仍超限：逐出最旧一条，保证可写入
          let oldestKey: string | undefined;
          let oldestReset = Infinity;
          for (const [k, e] of this.hits) {
            if (e.resetAt < oldestReset) {
              oldestReset = e.resetAt;
              oldestKey = k;
            }
          }
          if (oldestKey) this.hits.delete(oldestKey);
        }
      }
      this.hits.set(key, { count: 1, resetAt: now + ttlMs });
      return true;
    }

    entry.count++;
    return entry.count <= limit;
  }
}

/**
 * 读取 @RateLimit 元数据并执行限流。
 * key 默认取 req.ip（配合 trust proxy 配置，忽略客户端伪造的 X-Forwarded-For）。
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly limiter: RateLimiterService) {}

  canActivate(context: ExecutionContext): boolean {
    const config: RateLimitConfig | undefined = Reflect.getMetadata(
      RATE_LIMIT_META,
      context.getHandler(),
    );
    if (!config) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const key = config.keyBy ? config.keyBy(request) : request.ip || 'unknown';

    if (!this.limiter.check(key, config.limit, config.ttlMs)) {
      throw new HttpException(
        '请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
