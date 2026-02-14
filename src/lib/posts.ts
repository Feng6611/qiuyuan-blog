import { contentBundle, type BundledPost } from '@/generated/content-bundle'
import type { PostData, PostSummary } from '@/types/content'

function parseDate(date: string | null, fileName: string): Date {
  if (!date) {
    console.warn(`文件 ${fileName} 缺少日期`)
    return new Date(0)
  }

  const strict = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (strict) {
    const year = Number(strict[1])
    const month = Number(strict[2])
    const day = Number(strict[3])
    return new Date(Date.UTC(year, month - 1, day))
  }

  const fallback = new Date(date)
  if (!Number.isNaN(fallback.getTime())) {
    return fallback
  }

  console.warn(`文件 ${fileName} 的日期格式无效：${date}`)
  return new Date(0)
}

function toPostSummary(item: BundledPost): PostSummary {
  return {
    slug: item.slug,
    title: item.title ?? undefined,
    fileName: item.fileName,
    description: item.description,
    keywords: item.keywords,
    date: parseDate(item.date, item.fileName),
    tags: item.tags,
  }
}

function toPostData(item: BundledPost): PostData {
  return {
    slug: item.slug,
    title: item.title ?? undefined,
    fileName: item.fileName,
    description: item.description,
    keywords: item.keywords,
    content: item.content,
    date: parseDate(item.date, item.fileName),
    tags: item.tags,
  }
}

function sortByDateDesc(posts: PostSummary[]): PostSummary[] {
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function getPostIdMap(): Promise<Record<string, string>> {
  return Object.fromEntries(contentBundle.posts.map((item) => [item.fileNameBase, item.slug]))
}

export async function getSortedPostsData(): Promise<PostSummary[]> {
  const posts = contentBundle.posts
    .filter((item) => item.type === 'post')
    .map((item) => toPostSummary(item))

  return sortByDateDesc(posts)
}

export async function getDailyPostsData(): Promise<PostSummary[]> {
  const posts = contentBundle.posts
    .filter((item) => item.type === 'daily')
    .map((item) => toPostSummary(item))

  return sortByDateDesc(posts)
}

export async function getAllPostSlugs(): Promise<{ params: { slug: string } }[]> {
  return contentBundle.posts
    .filter((item) => item.type === 'post')
    .map((item) => ({ params: { slug: item.slug } }))
}

export async function getAllDailySlugs(): Promise<{ params: { slug: string } }[]> {
  return contentBundle.posts
    .filter((item) => item.type === 'daily')
    .map((item) => ({ params: { slug: item.slug } }))
}

export async function getPostData(slug: string): Promise<PostData | null> {
  const item = contentBundle.posts.find((entry) => entry.slug === slug)
  if (!item) return null

  return toPostData(item)
}

export async function getAboutContent(): Promise<string> {
  return contentBundle.about.content
}

export type { PostSummary, PostData } from '@/types/content'
