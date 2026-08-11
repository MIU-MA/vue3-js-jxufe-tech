/**
 * 允许的来源白名单。
 * 供 CORS 配置与 OriginGuard 共用，必须精确匹配（禁止 startsWith，
 * 防止 攻击者用 https://jxufe-tech.top.evil.com 之类前缀绕过）。
 */
export const ALLOWED_ORIGINS: readonly string[] = [
  "https://www.jxufe-tech.top",
  "https://jxufe-tech.top",
  "https://api.jxufe-tech.top",
  "https://miuma-blog.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export const ALLOWED_ORIGIN_SET: ReadonlySet<string> = new Set(ALLOWED_ORIGINS);
