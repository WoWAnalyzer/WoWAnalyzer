import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-json';

const config: LinguiConfig = {
  catalogs: [
    {
      path: 'src/localization/{locale}/messages',
      include: ['<rootDir>/src/'],
      exclude: ['**/node_modules/**'],
    },
  ],
  locales: ['de', 'en', 'es', 'fr', 'it', 'ko', 'pl', 'pt', 'ru', 'zh'],
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
  format: formatter({ style: 'minimal' }),
  orderBy: 'messageId',
};

export default config;
