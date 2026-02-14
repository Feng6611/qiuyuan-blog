import { getDailyPostsData } from "@/lib/posts"
import { PostList } from "@/components/blog"
import { getDictionary } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n.config";
import { getLocalePath } from '@/lib/utils';

export const revalidate = 300;

export default async function DailyPage() {
    const dictionary = await getDictionary(defaultLocale);
    const allPostsData = await getDailyPostsData();

    const pageTitle = dictionary['daily.title'] || "日常";
    const pageDescription = dictionary['daily.description'] || "人生到处知何似，应似飞鸿踏雪泥";

    const header = (
        <div className="mb-16">
            <h1 className="text-3xl font-semibold mb-4">{pageTitle}</h1>
            <p className="text-muted-foreground">{pageDescription}</p>
        </div>
    );
    return <PostList posts={allPostsData} baseUrl={getLocalePath(defaultLocale, 'daily')} header={header} lang={defaultLocale} />;
}
