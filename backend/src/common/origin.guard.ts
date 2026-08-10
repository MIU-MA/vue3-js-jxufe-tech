import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { ALLOWED_ORIGIN_SET } from './origins';

/**
 * 来源软校验（仅作辅助拦截，不承担认证职责）。
 *
 * - 仅当请求携带 Origin/Referer 时才校验；非浏览器客户端（curl、SSR 等）不强制。
 * - 取 URL 的 origin（scheme://host:port）做精确匹配，禁用 startsWith。
 * - 归一化失败（非法 URL）一律拒绝，宁严勿松。
 */
@Injectable()
export class OriginGuard implements CanActivate {
  private readonly logger = new Logger(OriginGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers['origin'];
    const referer = request.headers['referer'];

    const raw = origin || referer;
    if (!raw) return true;

    const source = normalizeOrigin(String(raw));
    if (ALLOWED_ORIGIN_SET.has(source)) return true;

    this.logger.warn(
      `拦截跨域请求: origin=${origin} referer=${referer} ip=${request.ip}`,
    );
    return false;
  }
}

/** 取 URL 的 scheme://host:port；解析失败返回原始串（不会命中白名单）。 */
function normalizeOrigin(source: string): string {
  try {
    return new URL(source).origin;
  } catch {
    return source;
  }
}
