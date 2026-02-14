import { getSortedPostsData } from "@/lib/posts"
import { PostList } from "@/components/blog"
import { getDictionary } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n.config";
import { getLocalePath } from "@/lib/utils";
import siteConfig from '@site-config';

// 添加ISR配置
export const revalidate = 300; // 5分钟重新验证

export default async function Home() {
    const dictionary = await getDictionary(defaultLocale);
    const allPostsData = await getSortedPostsData();

    // 从字典中获取翻译后的标题和描述
    const pageTitle = dictionary['home.title'] || siteConfig.title;
    const pageDescription = dictionary['home.description'] || siteConfig.description;

    const header = (
        <div className="mb-16">
            <h1 className="text-3xl font-semibold mb-4">{pageTitle}</h1>
            <p className="text-muted-foreground">{pageDescription}</p>
        </div>
    );

    return <PostList posts={allPostsData} baseUrl={getLocalePath(defaultLocale, 'posts')} header={header} lang={defaultLocale} />;
} 
