import React from 'react';
import { MDXContent } from '@/components/ui';
import { getAboutContent, getPostIdMap } from '@/lib/posts';
import { type Locale } from '@/lib/i18n.config';

export default async function AboutContent({ lang }: { lang: Locale }) {
    try {
        const content = await getAboutContent();

        return <MDXContent content={content} postIdMap={await getPostIdMap()} lang={lang} />;
    } catch (error) {
        console.error('Error rendering about page:', error);
        throw error;
    }
} 
