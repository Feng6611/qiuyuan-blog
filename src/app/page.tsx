import type { Metadata } from 'next';
import { defaultLocale } from '@/lib/i18n.config';
import LocaleHome, { revalidate } from './[lang]/page';
import { getLocaleUrl } from '@/lib/utils';
import { MainLayout } from '@/components/navigation';
import { getDictionary } from '@/lib/i18n';

export { revalidate };

export const metadata: Metadata = {
    alternates: {
        canonical: getLocaleUrl(defaultLocale),
        languages: {
            zh: getLocaleUrl(defaultLocale),
            en: getLocaleUrl('en'),
            'x-default': getLocaleUrl(defaultLocale),
        },
    },
};

export default async function RootPage() {
    const dictionary = await getDictionary(defaultLocale);
    const content = await LocaleHome();

    return (
        <MainLayout lang={defaultLocale} dictionary={dictionary}>
            {content}
        </MainLayout>
    );
}
