import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import type { IndexEntry, PostData, PostSummary } from '@/types/content'

dayjs.extend(customParseFormat)
dayjs.extend(utc)

const blogRoot = path.join(process.cwd(), 'blog')
const postsDirectory = path.join(blogRoot, 'home')
const dailyDirectory = path.join(blogRoot, 'daily')
const indexPath = path.join(process.cwd(), '.cache', 'content-index.json')

// 修改：添加 export
// 类型已迁移到 src/types/content.ts

// 添加缓存
let postsCache: PostSummary[] | null = null;
let dailyCache: PostSummary[] | null = null;
let slugMapCache: Map<string, IndexEntry> | null = null;
let postIdMapCache: Record<string, string> | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 提取日期解析函数
function parseDate(date: unknown, fileName: string): Date {
  if (!date) {
    console.warn(`文件 ${fileName} 缺少日期`);
    return new Date(0);
  }

  if (date instanceof Date) {
    return new Date(date.toISOString().split('T')[0]);  // 只保留日期部分
  }

  if (typeof date === 'string') {
    // 尝试解析日期（忽略时间部分）
    const parsedDate = dayjs(date).startOf('day').toDate();
    if (parsedDate.toString() !== 'Invalid Date') {
      return parsedDate;
    }
    console.warn(`文件 ${fileName} 的日期格式无效：${date}`);
  } else {
    console.warn(`文件 ${fileName} 的日期类型无效`);
  }

  return new Date(0);
}

// 加载内容索引（优先使用生成文件，不存在则回退扫描）
async function loadContentIndex(): Promise<IndexEntry[]> {
  // 尝试读取索引文件
  try {
    const buf = await fs.readFile(indexPath, 'utf8')
    const parsed = JSON.parse(buf)
    if (parsed && Array.isArray(parsed.items)) {
      return parsed.items as IndexEntry[]
    }
  } catch { }

  // 回退：扫描 blog 目录（开发环境缺少索引时）
  try {
    const dirs = [postsDirectory, dailyDirectory]
    const results: IndexEntry[] = []
    for (const dir of dirs) {
      const names = await fs.readdir(dir)
      for (const name of names) {
        const full = path.join(dir, name)
        const stat = await fs.stat(full)
        if (stat.isDirectory() || !name.endsWith('.md')) continue
        const rel = path.relative(blogRoot, full)
        const { data } = matter(await fs.readFile(full, 'utf8'))
        if (!data.slug) continue
        results.push({
          slug: String(data.slug),
          type: dir.includes('daily') ? 'daily' : 'post',
          filePath: rel,
          fileName: name,
          fileNameBase: name.replace(/\.md$/i, ''),
          title: data.title ? String(data.title) : null,
          date: typeof data.date === 'string' ? data.date : null,
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        })
      }
    }
    return results
  } catch (e) {
    console.error('Failed to load content index:', e)
    return []
  }
}

async function loadSlugMap(): Promise<Map<string, IndexEntry>> {
  if (slugMapCache && Date.now() - lastCacheTime < CACHE_DURATION) return slugMapCache
  const index = await loadContentIndex()
  slugMapCache = new Map(index.map((it) => [it.slug, it]))
  lastCacheTime = Date.now()
  // 也刷新 postIdMap 缓存
  postIdMapCache = Object.fromEntries(index.map((it) => [it.fileNameBase, it.slug]))
  return slugMapCache
}

export async function getPostIdMap(): Promise<Record<string, string>> {
  if (postIdMapCache && Date.now() - lastCacheTime < CACHE_DURATION) return postIdMapCache
  await loadSlugMap()
  return postIdMapCache || {}
}

// （移除未使用的 parsePostFile，索引驱动后不再需要逐文件解析）

// 列出文章（home）
export async function getSortedPostsData(): Promise<PostSummary[]> {
  const now = Date.now();
  if (postsCache && (now - lastCacheTime < CACHE_DURATION)) return postsCache
  try {
    const index = await loadContentIndex()
    const posts = index.filter((it) => it.type === 'post')
    const summaries: PostSummary[] = posts.map((it) => ({
      slug: it.slug,
      fileName: it.fileName,
      description: '',
      keywords: [],
      date: parseDate(it.date, it.fileName),
      tags: it.tags.map((t) => t.toLowerCase()),
    }))
    summaries.sort((a, b) => b.date.getTime() - a.date.getTime())
    postsCache = summaries
    lastCacheTime = now
    return summaries
  } catch (error) {
    console.error('Error loading posts index:', error)
    return []
  }
}

export async function getDailyPostsData(): Promise<PostSummary[]> {
  const now = Date.now();
  if (dailyCache && (now - lastCacheTime < CACHE_DURATION)) return dailyCache
  try {
    const index = await loadContentIndex()
    const posts = index.filter((it) => it.type === 'daily')
    const summaries: PostSummary[] = posts.map((it) => ({
      slug: it.slug,
      fileName: it.fileName,
      description: '',
      keywords: [],
      date: parseDate(it.date, it.fileName),
      tags: it.tags.map((t) => t.toLowerCase()),
    }))
    summaries.sort((a, b) => b.date.getTime() - a.date.getTime())
    dailyCache = summaries
    lastCacheTime = now
    return summaries
  } catch (error) {
    console.error('Error loading daily index:', error)
    return []
  }
}

// 新增：获取所有 post slugs (postid)
export async function getAllPostSlugs(): Promise<{ params: { slug: string } }[]> {
  try {
    const index = await loadContentIndex()
    return index.filter((it) => it.type === 'post').map((it) => ({ params: { slug: it.slug } }))
  } catch (error) {
    console.error('Error getting all post slugs:', error)
    return []
  }
}

// 新增：获取所有 daily slugs (postid)
export async function getAllDailySlugs(): Promise<{ params: { slug: string } }[]> {
  try {
    const index = await loadContentIndex()
    return index.filter((it) => it.type === 'daily').map((it) => ({ params: { slug: it.slug } }))
  } catch (error) {
    console.error('Error getting all daily slugs:', error)
    return []
  }
}

// 修改：根据 slug 查找文章，改为异步
async function findPostBySlug(slug: string): Promise<{ directory: string, fileName: string } | null> {
  const slugMap = await loadSlugMap()
  const entry = slugMap.get(slug)
  if (!entry) return null
  const abs = path.join(blogRoot, entry.filePath)
  return { directory: path.dirname(abs), fileName: path.basename(abs) }
}


// 修改：getPostData 改为接收 slug，并返回包含 SEO 数据的 PostData
export async function getPostData(slug: string): Promise<PostData | null> {
  const fileLocation = await findPostBySlug(slug); // 修改：调用 findPostBySlug

  if (!fileLocation) {
    return null;
  }

  const { directory, fileName } = fileLocation;
  const fullPath = path.join(directory, fileName);

  try {
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // 再次校验 slug 和 title，虽然 findPostBySlug 已经匹配了 slug
    const currentSlug = matterResult.data.slug;
    // const title = matterResult.data.title; // 不再强制要求 title

    if (!currentSlug || currentSlug !== slug) {
      console.warn(`Slug mismatch or missing in ${fileName} after finding it. Expected: ${slug}, Found: ${currentSlug}`);
      return null;
    }
    // if (!title) { // 不再强制要求 title
    //   console.warn(`Title missing in ${fileName} for slug ${slug}.`);
    //   return null;
    // }

    const description = matterResult.data.description || '';
    const keywords = Array.isArray(matterResult.data.keywords)
      ? matterResult.data.keywords.map(String)
      : typeof matterResult.data.keywords === 'string'
        ? matterResult.data.keywords.split(',').map(k => k.trim()).filter(k => k)
        : [];

    const postDate = parseDate(matterResult.data.date, fileName);

    return {
      slug,
      fileName,
      // title, // 不再返回 title，因为列表直接用文件名
      description,
      keywords,
      content: matterResult.content,
      date: postDate,
      tags: Array.isArray(matterResult.data.tags)
        ? matterResult.data.tags.map(tag => String(tag).toLowerCase())
        : [],
    };
  } catch (error) {
    console.error(`Error reading post data for ${fileName} (slug: ${slug}):`, error);
    return null;
  }
}

// 向后兼容：从此模块导出类型，便于其他文件按原路径导入
export type { PostSummary, PostData } from '@/types/content'
