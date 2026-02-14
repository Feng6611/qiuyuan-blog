/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'zh',
    locales: ['en', 'zh'],
  },
  /**
   * @link https://github.com/i18next/next-i18next#6-advanced-configuration
   */
  // localePath: path.resolve('./public/locales'), // 如果你的 locales 目录不在 public/locales, 请取消注释并修改此行
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  // debug: process.env.NODE_ENV === 'development',
  // saveMissing: false, // an option if you want to see missing keys in development
  // strictMode: true,
  // serializeConfig: false, // because we use a function as a transKeepBasicHtmlNodesFor
  // react: { useSuspense: false } // fix suspense issue for next-i18next
} 