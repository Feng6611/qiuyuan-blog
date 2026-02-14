/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { Pluggable } from 'unified';
import { type Locale } from '@/lib/i18n.config';

// Plugins
import remarkGfm from 'remark-gfm';
import remarkPanguSpacing from '@/lib/mdx-plugins/remark-pangu-spacing.mjs';
import remarkCustomImagesAndLinks from '@/lib/mdx-plugins/remark-custom-images-and-links.mjs';
import remarkCustomLineBreaks from '@/lib/mdx-plugins/remark-custom-line-breaks.mjs';

interface MDXContentProps {
  content: string; // raw Markdown
  postIdMap: Record<string, string>; // fileNameBase -> slug
  lang?: Locale; // locale for localized links
}

export default async function MDXContent({ content, postIdMap, lang }: MDXContentProps) {
  const remarkPlugins: Pluggable[] = [
    remarkGfm,
    remarkPanguSpacing,
    [remarkCustomImagesAndLinks, { postIdMap, lang }],
    remarkCustomLineBreaks,
  ];

  // Workers runtime disallows codegen-from-strings (eval/new Function), so avoid MDX runtimes.
  // Render markdown -> HTML on the server/edge, then inject as static HTML.
  const processor = unified().use(remarkParse);

  for (const entry of remarkPlugins) {
    if (Array.isArray(entry)) {
      const [plugin, opts] = entry as any[];
      processor.use(plugin as any, opts as any);
    } else {
      processor.use(entry as any);
    }
  }

  const file = await processor.use(remarkRehype).use(rehypeStringify).process(content);

  const html = String(file);

  return (
    <div
      className="prose prose-base max-w-none
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
      [&_a:not([href^='/']):not([href^='#'])]:after:content-[']]↗']"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
