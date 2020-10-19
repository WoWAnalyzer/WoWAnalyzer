import React from 'react';
import { Catalogs, setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import LocalizationLoader from './LocalizationLoader';

export const i18n = setupI18n();

type Props = {
  children: React.ReactNode
}

const RootLocalizationProvider = ({ children }: Props) => (
  <LocalizationLoader>
    {({ language, catalogs }: { language: string, catalogs: Catalogs }) => (
      <I18nProvider i18n={i18n} language={language} catalogs={catalogs}>
        {children}
      </I18nProvider>
    )}
  </LocalizationLoader>
);

export default RootLocalizationProvider;
