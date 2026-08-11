export interface Article {
  id: number
  title: string
  content: string
  summary: string | null
  publishedAt: string | null
  createdAt: string
}

// SSR（构建时）走绝对 API 地址，保证 vite-ssg build 能抓取 CMS 文章；
// 客户端走相对路径（同源代理）。
// VITE_SSG_API_BASE 是站点 origin（如 https://api.jxufe-tech.top），接口路径补上 /api。
const ORIGIN = import.meta.env.SSR
  ? (import.meta.env.VITE_SSG_API_BASE as string) || ''
  : ''
const BASE = import.meta.env.SSR ? `${ORIGIN}/api` : '/api'

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${BASE}/articles`)
  if (!res.ok) throw new Error(`获取文章列表失败: ${res.status}`)
  return res.json()
}

export async function fetchArticle(id: string | number): Promise<Article> {
  const res = await fetch(`${BASE}/articles/${id}`)
  if (!res.ok) throw new Error(`获取文章失败: ${res.status}`)
  return res.json()
}
