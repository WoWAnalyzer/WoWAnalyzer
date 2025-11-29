import { i18n } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { getLanguage } from 'interface/selectors/language';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { ReactNode, useEffect, useState } from 'react';
import { useHead } from '@unhead/react';

const loadCatalog = async (locale: string) => {
  const { messages } = await import(`./${locale}/messages.json?lingui`);

  i18n.load(locale, messages);
  i18n.activate(locale);
};

interface Props {
  children: ReactNode;
}

const I18nProvider = ({ children }: Props) => {
  const locale = useWaSelector((state) => getLanguage(state));
  const [activeLocale, setActiveLocale] = useState<string | undefined>(undefined);

  // Specify the correct language to disable translation plugins, and try to disable translation
  // plugins. This is needed because they modify the DOM, which can cause React to crash.
  useHead({
    htmlAttrs: {
      lang: activeLocale,
      translate: 'no',
    },
  });

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

  return <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>;
};

export default I18nProvider;
