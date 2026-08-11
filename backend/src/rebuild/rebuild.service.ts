import { Injectable, Logger } from "@nestjs/common";

/**
 * 触发前端 SSG 重建：调用 GitHub Actions 的 workflow_dispatch（rebuild.yml）。
 * 未配置 GITHUB_REBUILD_TOKEN 时跳过（手动重建），不阻塞业务。
 */
@Injectable()
export class RebuildService {
  private readonly logger = new Logger(RebuildService.name);

  /** 触发重建。返回是否已实际触发（无令牌时返回 false）。 */
  async trigger(reason = "cms-article-updated"): Promise<boolean> {
    const token = process.env.GITHUB_REBUILD_TOKEN;
    const repo = process.env.GITHUB_REPO || "jxufe-tech/jxufe-tech-web";

    if (!token) {
      this.logger.warn(
        "未配置 GITHUB_REBUILD_TOKEN，跳过自动重建（请手动触发 rebuild workflow）",
      );
      return false;
    }

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/actions/workflows/rebuild.yml/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "jxufe-tech-web-backend",
          },
          body: JSON.stringify({ ref: "main", inputs: { reason } }),
        },
      );

      if (!res.ok) {
        this.logger.error(
          `GitHub dispatch 失败: ${res.status} ${await res.text()}`,
        );
        return false;
      }

      this.logger.log("已触发前端 SSG 重建（rebuild.yml workflow_dispatch）");
      return true;
    } catch (err) {
      this.logger.error(`触发重建失败: ${(err as Error).message}`);
      return false;
    }
  }
}
