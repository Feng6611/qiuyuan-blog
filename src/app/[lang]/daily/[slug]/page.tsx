import { type Locale } from "@/lib/i18n.config";
import { PostDetail } from '@/components/blog';
import { getPostData, getAllDailySlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { getDictionary } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from 'next';
import { getLocaleUrl } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams({ params: { lang } }: { params: { lang: Locale } }): Promise<{ slug: string }[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _langForEslint = lang;
    const slugsData = await getAllDailySlugs();
    return slugsData.map((item) => ({
        slug: item.params.slug,
    }));
}

interface DailyPostPageProps {
    params: {
        slug: string;
        lang: Locale;
    };
}

export async function generateMetadata(
    { params }: DailyPostPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const post = await getPostData(params.slug);

    if (!post) {
        const previousTitle = (await parent).title?.absolute || "Daily Entry Not Found";
        return {
            title: previousTitle,
            description: "The daily entry you are looking for could not be found.",
        };
    }

    // 您需要将下面的 baseUrl 替换为您的实际网站域名
    // 考虑使用环境变量，例如 process.env.NEXT_PUBLIC_SITE_URL
    const canonicalUrl = getLocaleUrl(params.lang, `daily/${post.slug}`);

    return {
        title: post.title,
        description: post.description,
        keywords: post.keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            url: canonicalUrl,
            type: 'article',
            publishedTime: post.date.toISOString(),
            authors: [],
            tags: post.tags,
        },
    };
}

export default async function DailyPostPage({ params }: DailyPostPageProps) {
    const dictionary = await getDictionary(params.lang);

    const postData = await getPostData(params.slug /*, params.lang */);

    if (!postData) {
        notFound();
    }

    return <PostDetail post={postData} lang={params.lang} dictionary={dictionary} />;
} 
