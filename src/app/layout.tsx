import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { defaultLocale, locales, type Locale } from '@/lib/i18n.config';
import { getHtmlLang } from '@/lib/utils';
import siteConfig from '@site-config';

export const metadata: Metadata = {
    title: siteConfig.title,
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.domain),
};

function resolveLocale(candidate?: string | null): Locale {
    if (candidate && locales.includes(candidate as Locale)) {
        return candidate as Locale;
    }
    return defaultLocale;
}

export default function RootLayout(
    {
        children,
        params,
    }: {
        children: ReactNode;
        params: { lang?: string };
    },
) {
    const locale = resolveLocale(params?.lang);
    const htmlLang = getHtmlLang(locale);

    return (
        <html lang={htmlLang}>
            <body className="antialiased min-h-screen flex flex-col bg-background font-sans">
                {children}
            </body>
        </html>
    );
}
