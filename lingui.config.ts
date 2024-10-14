import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-json';

const config: LinguiConfig = {
  catalogs: [
    {
      path: 'src/localization/{locale}/messages',
      include: ['<rootDir>/src/'],
      // stats uses import syntax that lingui doesn't support. overriding the plugin list for lingui is very involved.
      exclude: ['**/node_modules/**', '<rootDir>/src/parser/core/stats.ts'],
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
