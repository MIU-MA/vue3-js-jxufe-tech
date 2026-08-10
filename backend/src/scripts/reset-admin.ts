/**
 * 管理员密码重置脚本（一次性运维工具）。
 *
 * 用法（仓库根目录）：
 *   npm run reset:admin
 *
 * 读取 backend/.env 或环境变量中的 ADMIN_USERNAME / ADMIN_PASSWORD，
 * 将现有管理员账号的密码更新为该值（bcrypt 加盐哈希入库）。
 * 账号不存在则直接创建；已存在则仅覆盖密码，不触碰其他字段。
 *
 * 说明：仅修改环境变量不会更新已创建的旧账号，需要本脚本显式重置。
 */
import 'reflect-metadata';
import { loadEnv } from '../common/env.config';
import { DataSource } from 'typeorm';
import { resolve } from 'path';
import * as bcrypt from 'bcryptjs';
import { User } from '../auth/entities/user.entity';
import { BCRYPT_ROUNDS } from '../auth/auth.constants';

loadEnv();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('❌ 需要 ADMIN_USERNAME 与 ADMIN_PASSWORD 环境变量（backend/.env 或环境变量）');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error(`❌ ADMIN_PASSWORD 长度必须至少为 8（当前 ${password.length}）`);
    process.exit(1);
  }

  // 数据库默认位于 backend/data.db（与后端进程一致）；测试可用 DB_PATH 覆盖
  const database = process.env.DB_PATH || resolve(__dirname, '..', '..', 'data.db');

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database,
    entities: [User],
    synchronize: false,
  });
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user = await userRepo.findOne({ where: { username } });
  if (user) {
    user.password = hash;
    await userRepo.save(user);
    console.log(`✅ 管理员 "${username}" 密码已重置（bcrypt 哈希已更新）`);
  } else {
    user = userRepo.create({ username, password: hash });
    await userRepo.save(user);
    console.log(`✅ 管理员 "${username}" 不存在，已创建新账号`);
  }

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('❌ 重置失败:', err);
  process.exit(1);
});
