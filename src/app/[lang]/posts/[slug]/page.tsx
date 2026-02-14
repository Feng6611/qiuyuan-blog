import { PostDetail } from '@/components/blog';
import { getAllPostSlugs, getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { getDictionary } from "@/lib/i18n"; // 导入
import { defaultLocale, type Locale } from "@/lib/i18n.config"; // 导入
import { Metadata, ResolvingMetadata } from 'next';
import { getLocaleUrl } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams({ params: { lang } }: { params: { lang: Locale } }): Promise<{ slug: string }[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _langForEslint = lang; // Use lang so ESLint doesn't complain if getAllPostSlugs doesn't use it yet

    const slugsData = await getAllPostSlugs(); // 假设 getAllPostSlugs 已被修改返回 { params: { slug: string } }[]
    return slugsData.map(item => ({ slug: item.params.slug }));
}

interface PostPageProps {
    params: {
        slug: string;
        lang: Locale;
    };
}

export async function generateMetadata(
    { params }: PostPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const post = await getPostData(params.slug);

    if (!post) {
        // notFound() // notFound 不能在 generateMetadata 中调用
        // 如果文章未找到，可以返回一个默认的 metadata 或者让 Next.js 处理
        // 尝试从父级获取标题，或设置一个通用标题
        const previousTitle = (await parent).title?.absolute || "Post Not Found";
        return {
            title: previousTitle,
            description: "The post you are looking for could not be found.",
        };
    }

    // 可选地：合并父级 metadata
    // const previousKeywords = (await parent).keywords || [];

    // 您需要将下面的 baseUrl 替换为您的实际网站域名
    // 考虑使用环境变量，例如 process.env.NEXT_PUBLIC_SITE_URL
    const canonicalUrl = getLocaleUrl(defaultLocale, `posts/${post.slug}`);

    return {
        title: post.title,
        description: post.description,
        keywords: post.keywords, // keywords 应该是 string[]
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            // images: post.ogImage ? [post.ogImage.url] : [], // 假设有 ogImage 字段
            url: canonicalUrl, // 使用完整的 canonicalUrl 作为 og:url
            type: 'article',
            publishedTime: post.date.toISOString(),
            authors: [], // 根据需要添加作者信息
            tags: post.tags,
        },
        // 根据需要添加其他 metadata，例如 twitter cards
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const dictionary = await getDictionary(defaultLocale);
    const postData = await getPostData(params.slug);

    if (!postData) {
        notFound();
    }
    // PostDetail 可能也需要 lang 和 dictionary
    return <PostDetail post={postData} lang={defaultLocale} dictionary={dictionary} />;
} 
