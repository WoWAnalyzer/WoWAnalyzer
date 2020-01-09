import React from 'react';
import PropTypes from 'prop-types';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import LocalizationLoader from './LocalizationLoader';

export const i18n = setupI18n();

const RootLocalizationProvider = (
  {
    children,
  },
) => {
  return (
    <LocalizationLoader>
      {({ language, catalogs }) => (
        <I18nProvider i18n={i18n} language={language} catalogs={catalogs}>
          {children}
        </I18nProvider>
      )}
    </LocalizationLoader>
  );
};

RootLocalizationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RootLocalizationProvider;
