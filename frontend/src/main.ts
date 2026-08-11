import { ViteSSG } from 'vite-ssg'
import { createI18n } from 'vue-i18n'
import type { RouteLocationNormalized } from 'vue-router'
import App from './App.vue'
import routes from '~pages'

import zh from './i18n/locales/zh.json'
import en from './i18n/locales/en.json'
import { getInitialLocale } from './composables/useLocale'
import { fetchArticles } from './api/articles'

import './assets/main.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to: RouteLocationNormalized, _from: RouteLocationNormalized, savedPosition: any) {
      if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
      return { top: 0 }
    }
  },
  ({ app, isClient }) => {
    const i18n = createI18n({
      legacy: false,
      locale: isClient ? getInitialLocale() : 'zh',
      fallbackLocale: 'zh',
      messages: { zh, en }
    })
    app.use(i18n)
  }
)

/**
 * SSG 构建时：抓取 CMS 文章，把 /news/:id 动态路由展开成具体静态页。
 * - 配置了 VITE_SSG_API_BASE 时 API 不可达则构建失败（防止静默生成空页）
 * - 未配置 base 时回退仅构建静态路由并告警
 */
export async function includedRoutes(paths: string[], routes: any[]): Promise<string[]> {
  const base = import.meta.env.VITE_SSG_API_BASE as string | undefined
  if (!base) {
    console.warn('[SSG] 未配置 VITE_SSG_API_BASE，新闻详情页不会预渲染（客户端运行时抓取）')
    return paths
  }

  let articles: { id: number }[] = []
  try {
    articles = await fetchArticles()
  } catch (err) {
    console.error('[SSG] 抓取文章列表失败，终止构建', err)
    throw err
  }

  // 过滤动态路由模板（如 /news/:id），替换为具体的文章页
  const staticPaths = paths.filter((p) => !p.includes(':'))
  return staticPaths.concat(articles.map((a) => `/news/${a.id}`))
}
