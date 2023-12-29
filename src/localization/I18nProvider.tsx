import { i18n } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { getLanguage } from 'interface/selectors/language';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

const loadCatalog = async (locale: string) => {
  const { default: messages } = await import(`./${locale}/messages.json?lingui`);

  i18n.load(locale, messages);
  i18n.activate(locale);
};

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

    loadCatalog(locale)
      .then(() => {
        setActiveLocale(locale);
      })
      .catch((error) => {
        console.error('Unable to set locale', error);
      });
  }, [locale, activeLocale, setActiveLocale]);

  if (!activeLocale && import.meta.env.MODE !== 'test') {
    // Wait with rendering the app until we have the locale loaded. This reduces
    // the amount of significant screen updates, providing a better user
    // experience.
    return null;
  }

  return (
    <LinguiI18nProvider i18n={i18n}>
      <Helmet>
        {/* Specify the correct language to disable translation plugins, and try to disable translation plugins. This is needed because they modify the DOM, which can cause React to crash. */}
        <html lang={activeLocale} translate="no" />
      </Helmet>

      {children}
    </LinguiI18nProvider>
  );
};

export default I18nProvider;
