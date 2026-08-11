import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiUsage } from "./entities/ai-usage.entity";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface BudgetStatus {
  enabled: boolean;
  requests: number;
  requestLimit: number;
  tokensUsed: number;
  tokenBudget: number;
}

/** 今天的 YYYY-MM-DD */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * AI 每日预算控制：超请求数或超 token 用量后自动关闭聊天功能。
 * 计数持久化到 DB，避免进程重启丢失，也能在多实例部署下近似生效。
 */
@Injectable()
export class AiBudgetService {
  private readonly logger = new Logger(AiBudgetService.name);

  private readonly requestLimit = Number(
    process.env.AI_DAILY_REQUEST_LIMIT ?? 200,
  );
  private readonly tokenBudget = Number(
    process.env.AI_DAILY_TOKEN_BUDGET ?? 200_000,
  );
  private enabled = true;

  constructor(
    @InjectRepository(AiUsage)
    private usageRepo: Repository<AiUsage>,
  ) {}

  /** 检查今日是否还可继续使用聊天。超限返回 false（调用方返回 429）。 */
  async check(): Promise<boolean> {
    if (!this.enabled) return false;
    const row = await this.getOrCreateToday();
    const ok =
      row.requests < this.requestLimit &&
      row.promptTokens + row.completionTokens < this.tokenBudget;
    if (!ok) {
      this.enabled = false;
      this.logger.warn(
        `AI 每日预算已用完：请求 ${row.requests}/${this.requestLimit}，tokens ${row.promptTokens + row.completionTokens}/${this.tokenBudget}`,
      );
    }
    return ok;
  }

  /** 记录一次请求的用量，超 token 预算则关闭聊天。 */
  async record(usage: TokenUsage): Promise<void> {
    const row = await this.getOrCreateToday();
    row.requests += 1;
    row.promptTokens += usage.promptTokens || 0;
    row.completionTokens += usage.completionTokens || 0;
    await this.usageRepo.save(row);

    if (row.promptTokens + row.completionTokens >= this.tokenBudget) {
      this.enabled = false;
      this.logger.warn(
        "AI 已达每日 token 预算上限，聊天功能已关闭（次日自动恢复）",
      );
    }
  }

  /** 当前状态，供 GET /api/chat/status 展示。 */
  async status(): Promise<BudgetStatus> {
    const row = await this.getOrCreateToday();
    return {
      enabled: this.enabled && row.requests < this.requestLimit,
      requests: row.requests,
      requestLimit: this.requestLimit,
      tokensUsed: row.promptTokens + row.completionTokens,
      tokenBudget: this.tokenBudget,
    };
  }

  private async getOrCreateToday(): Promise<AiUsage> {
    const key = todayKey();
    const existing = await this.usageRepo.findOne({ where: { date: key } });
    if (existing) return existing;
    const row = this.usageRepo.create({ date: key });
    return this.usageRepo.save(row);
  }
}
