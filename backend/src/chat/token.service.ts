import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';

/**
 * 聊天会话令牌服务。
 * - 令牌由服务端 HMAC 签名 + 随机 nonce，客户端无法伪造。
 * - TTL 24h：保持对话历史连续性（历史由后端按 token 维护）。
 * - nonce 保证每次签发唯一，避免同一 IP+时间戳复用同一令牌。
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly tokens = new Map<string, number>();

  private readonly SECRET =
    process.env.CHAT_TOKEN_SECRET || randomBytes(32).toString('hex');
  private readonly TTL_MS = 24 * 60 * 60 * 1000;

  generate(ip: string): string {
    const timestamp = Date.now();
    const nonce = randomBytes(8).toString('hex');
    const hmac = createHmac('sha256', this.SECRET)
      .update(`${ip}:${timestamp}:${nonce}`)
      .digest('hex')
      .slice(0, 24);
    const token = `${timestamp}:${nonce}:${hmac}`;

    this.tokens.set(token, timestamp);
    this.cleanup();
    return token;
  }

  /** 校验令牌是否由服务端签发且未过期。 */
  validate(ip: string, token: string): boolean {
    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const timestamp = parseInt(parts[0], 10);
    if (isNaN(timestamp)) return false;

    if (Date.now() - timestamp > this.TTL_MS) return false;

    // token 必须是服务端签发的（防伪造）
    if (!this.tokens.has(token)) return false;

    const expectedHmac = createHmac('sha256', this.SECRET)
      .update(`${ip}:${timestamp}:${parts[1]}`)
      .digest('hex')
      .slice(0, 24);

    return parts[2] === expectedHmac;
  }

  /** 作废令牌（用于"新对话"），返回是否存在。 */
  invalidate(token: string): boolean {
    return this.tokens.delete(token);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, ts] of this.tokens) {
      if (now - ts > this.TTL_MS) this.tokens.delete(token);
    }
  }
}
