import type { Metadata } from "next";
import { MainLayout } from "@/components/navigation";
import { getDictionary } from '@/lib/i18n';
import { defaultLocale, type Locale } from '@/lib/i18n.config';
import type { ReactNode } from "react";
import { getLocaleUrl } from '@/lib/utils';
import siteConfig from '@site-config';

export async function generateMetadata(
    { params }: { params: { lang: Locale } }
): Promise<Metadata> {
    const dictionary = await getDictionary(params.lang);
    const pageTitle = dictionary['metadata.title'] || siteConfig.title;
    const pageDescription = dictionary['metadata.description'] || siteConfig.description;

    return {
        title: pageTitle,
        description: pageDescription,
        icons: {
            icon: [
                {
                    url: '/icon-32.png',
                    sizes: '32x32',
                    type: 'image/png'
                },
                {
                    url: '/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png'
                }
            ]
        },
        alternates: {
            canonical: getLocaleUrl(params.lang),
            languages: {
                en: getLocaleUrl('en'),
                zh: getLocaleUrl(defaultLocale),
                'x-default': getLocaleUrl(defaultLocale),
            },
        },
    };
}

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
    children: ReactNode;
    params: { lang: Locale };
}>) {
    const dictionary = await getDictionary(params.lang);

    return (
        <MainLayout lang={params.lang} dictionary={dictionary}>
            {children}
        </MainLayout>
    );
}
