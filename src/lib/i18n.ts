import 'server-only' // 确保这个模块只在服务端导入
import { locales, defaultLocale, type Locale, type Dictionary } from './i18n.config'; // 从新文件导入

// 使用 Record 和 Locale 类型来定义字典的结构
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/../public/locales/en/common.json').then((module) => module.default),
  zh: () => import('@/../public/locales/zh/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const loadDictionary = dictionaries[locale] ?? dictionaries[defaultLocale];
  try {
    return await loadDictionary();
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error);
    // 如果特定语言加载失败，回退到默认语言的字典
    if (locale !== defaultLocale) {
      console.warn(`Falling back to default locale (${defaultLocale}) dictionary.`);
      const loadDefaultDictionary = dictionaries[defaultLocale];
      try {
        return await loadDefaultDictionary();
      } catch (fallbackError) {
        console.error(`Error loading default dictionary for locale: ${defaultLocale}`, fallbackError);
        return {} as Dictionary; // 万一默认字典也失败，返回空对象
      }
    }
    return {} as Dictionary; // 如果特定语言字典加载失败且它就是默认语言，返回空对象
  }
};

// 将 locales, defaultLocale 和 Locale 类型也从这里导出，以保持向后兼容性 (如果有些地方还没改)
// 或者，确保所有引用都已更新到 i18n.config.ts
export { locales, defaultLocale, type Locale, type Dictionary }; 