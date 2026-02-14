import React from 'react';
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { Pluggable } from 'unified';
import { type Locale } from '@/lib/i18n.config';

// 导入插件
import remarkGfm from 'remark-gfm';
import remarkPanguSpacing from '@/lib/mdx-plugins/remark-pangu-spacing.mjs';
import remarkCustomImagesAndLinks from '@/lib/mdx-plugins/remark-custom-images-and-links.mjs';
import remarkCustomLineBreaks from '@/lib/mdx-plugins/remark-custom-line-breaks.mjs';

// 导入数据获取函数
// postIdMap 由调用方注入，避免组件内部全量扫描内容

// 导入自定义组件
import CenteredImage from './CenteredImage'; // 确认路径正确

interface MDXContentProps {
    content: string; // 原始 Markdown/MDX
    postIdMap: Record<string, string>; // fileNameBase -> slug
    lang?: Locale; // 当前语言，用于生成本地化链接
}

// 修改为 async 组件以获取数据
export default async function MDXContent({ content, postIdMap, lang }: MDXContentProps) {

    // 修正：将插件放回 options.mdxOptions，并明确类型
    const remarkPlugins: Pluggable[] = [
        remarkGfm,
        remarkPanguSpacing,
        [remarkCustomImagesAndLinks, { postIdMap, lang }],
        // 自定义：将“单个换行”拆分为新的段落 <p>（保留 MDX 其余默认行为）
        remarkCustomLineBreaks,
    ];
    const rehypePlugins: Pluggable[] = []; // 明确类型

    const options: MDXRemoteProps['options'] = { // 明确 options 类型
        mdxOptions: {
            remarkPlugins,
            rehypePlugins,
        },
        // parseFrontmatter: false, // 可以根据需要设置
    };

    const components: MDXRemoteProps['components'] = { // 明确 components 类型
        CenteredImage: CenteredImage,
        // ... 其他自定义组件
    };

    return (
        <div className="prose prose-base max-w-none
            /* 移除标题相关的 prose-hX:* 类，样式由 typography 插件处理 */
            prose-p:leading-relaxed 
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 hover:prose-a:underline
            prose-a:transition-colors
            prose-img:rounded-lg prose-img:shadow-sm prose-img:my-8
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-6 prose-ol:my-6 prose-li:my-2
            prose-blockquote:text-muted-foreground prose-blockquote:border-l-2 
            prose-blockquote:border-muted prose-blockquote:pl-6 prose-blockquote:italic
            prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm
            prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted/70 prose-pre:rounded-md prose-pre:shadow-sm prose-pre:p-4 prose-pre:overflow-x-auto
            prose-pre:text-sm
            prose-pre code:bg-transparent prose-pre code:p-0 prose-pre code:text-foreground/90
            prose-table:table-auto prose-th:min-w-[100px] prose-td:min-w-[100px]
            [&_a]:before:content-['[['] [&_a]:after:content-[']]']
            [&_a:not([href^='/']):not([href^='#'])]:after:content-[']]↗']">
            <MDXRemote
                source={content}
                options={options}
                components={components}
            />
        </div>
    );
} 
