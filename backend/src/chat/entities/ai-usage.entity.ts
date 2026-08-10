import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * 每日 AI 用量统计（按天一行，date 为 YYYY-MM-DD 主键）。
 * 落库使预算在多实例下仍能生效（各实例共享同一 SQLite/DB）。
 */
@Entity('ai_usage')
export class AiUsage {
  @PrimaryColumn({ type: 'text', length: 10 })
  date: string;

  @Column({ type: 'integer', default: 0 })
  requests: number;

  @Column({ type: 'integer', default: 0 })
  promptTokens: number;

  @Column({ type: 'integer', default: 0 })
  completionTokens: number;
}
