export default {
  catalogs: [
    {
      path: 'src/localization/{locale}/messages',
      include: ['<rootDir>/src/', '<rootDir>/analysis/'],
    },
  ],
  locales: ['de', 'en', 'es', 'fr', 'it', 'ko', 'pl', 'pt', 'ru', 'zh'],
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
  format: 'minimal',
};
