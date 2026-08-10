/**
 * 认证相关常量。
 */

/**
 * bcrypt cost factor。
 * 12 rounds 在现代硬件上约 250ms/次，兼顾安全与登录响应。
 * 旧值为 10，已统一提升；已有 10-rounds 哈希仍可被 bcrypt.compare
 * 正常验证（rounds 嵌在哈希串里，自适应），改密后升级为 12。
 */
export const BCRYPT_ROUNDS = 12;

/**
 * 历史遗留的公开已知默认弱口令（admin/admin123）。
 *
 * 注意：不再用于创建账号（数据库为空且未配置 ADMIN_PASSWORD 时服务拒绝启动，
 * 杜绝生成已知默认账号）。仅用于检测旧账号是否仍在使用该弱口令，以便自动升级。
 */
export const DEFAULT_ADMIN_PASSWORD = 'admin123';
