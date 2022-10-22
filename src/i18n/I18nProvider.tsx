import { ReactNode, useEffect, useState } from 'react';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { getLanguage } from 'interface/selectors/language';
import { Helmet } from 'react-helmet';

import TypesafeI18n from './i18n-react';
import { isLocale } from 'i18n/i18n-util';
import { loadLocaleAsync } from 'i18n/i18n-util.async';

interface Props {
  children: ReactNode;
}

const I18nProvider = ({ children }: Props) => {
  const locale = useWaSelector((state) => getLanguage(state));
  const [activeLocale, setActiveLocale] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (activeLocale === locale) {
      return;
    }
    if (!isLocale(locale)) {
      return;
    }

    loadLocaleAsync(locale)
      .then(() => {
        setActiveLocale(locale);
      })
      .catch((error) => {
        console.error('Unable to set locale', error);
      });
  }, [locale, activeLocale, setActiveLocale]);

  if (!activeLocale && process.env.NODE_ENV !== 'test') {
    // Wait with rendering the app until we have the locale loaded. This reduces
    // the amount of significant screen updates, providing a better user
    // experience.
    return null;
  }
  if (!isLocale(locale)) {
    return null;
  }

  return (
    <TypesafeI18n locale={locale}>
      <Helmet>
        {/* Specify the correct language to disable translation plugins, and try to disable translation plugins. This is needed because they modify the DOM, which can cause React to crash. */}
        <html lang={activeLocale} translate="no" />
      </Helmet>

      {children}
    </TypesafeI18n>
  );
};

export default I18nProvider;
