import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { BCRYPT_ROUNDS, DEFAULT_ADMIN_PASSWORD } from './auth.constants';

/**
 * 数据库种子服务 -- 应用启动时自动执行。
 *
 * 安全策略：
 * - 数据库为空时**绝不创建公开已知的默认账号**（admin/admin123）。
 *   未配置 ADMIN_USERNAME / ADMIN_PASSWORD 时直接拒绝启动。
 * - 检测到已有账号仍在使用历史遗留弱口令（admin123）时，若配置了
 *   ADMIN_PASSWORD 则自动升级为该密码（"旧的 admin123 无法登录"）；
 *   未配置则持续告警。
 *
 * 密码安全：无论来源，入库前一律 bcrypt 加盐哈希，数据库永不存明文。
 * 登录时用 bcrypt.compare 比对哈希。
 */
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();

    if (count === 0) {
      await this.createInitialAdmin();
      return;
    }

    await this.upgradeLegacyWeakPasswords();
  }

  /**
   * 数据库为空时创建初始管理员。
   * 必须显式提供 ADMIN_USERNAME / ADMIN_PASSWORD，否则拒绝启动。
   */
  private async createInitialAdmin() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      console.error('══════════════════════════════════════════');
      console.error('  🚨 数据库为空，且未设置 ADMIN_USERNAME / ADMIN_PASSWORD');
      console.error('     为避免创建公开已知的默认账号，服务拒绝启动。');
      console.error('     请在 backend/.env 或环境变量中配置（密码 >= 8 字符）。');
      console.error('══════════════════════════════════════════');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const admin = this.userRepo.create({ username, password: hashedPassword });
    await this.userRepo.save(admin);

    console.log('══════════════════════════════════════════');
    console.log('  🔐 管理员账号已创建');
    console.log(`  用户名: ${username}`);
    console.log('  密码:   (来自 ADMIN_PASSWORD 环境变量，已隐藏)');
    console.log('  密码已 bcrypt 加盐哈希存储，数据库无明文');
    console.log('══════════════════════════════════════════');
  }

  /**
   * 已有账号时，检测历史遗留弱口令（admin123）并升级。
   * 仅比对已知默认弱口令，不泄露其他信息；也只对仍使用该弱口令的账号生效，
   * 不会覆盖用户后来主动修改的密码。
   */
  private async upgradeLegacyWeakPasswords() {
    const users = await this.userRepo.find();
    const newPassword = process.env.ADMIN_PASSWORD;

    for (const user of users) {
      const isLegacy = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, user.password);
      if (!isLegacy) continue;

      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await this.userRepo.save(user);
        console.log(
          `[Seed] 🔐 账号 "${user.username}" 已从旧默认弱口令升级为 ADMIN_PASSWORD 配置的密码`,
        );
      } else {
        console.log('══════════════════════════════════════════');
        console.log('  🚨 安全警告：检测到弱口令');
        console.log(`  账号 "${user.username}" 仍在使用默认密码 ${DEFAULT_ADMIN_PASSWORD}`);
        console.log('  该口令公开已知，任何人都能登录后台！');
        console.log('  请设置 ADMIN_PASSWORD 环境变量后重启，或执行 npm run reset:admin');
        console.log('══════════════════════════════════════════');
      }
    }
  }
}
