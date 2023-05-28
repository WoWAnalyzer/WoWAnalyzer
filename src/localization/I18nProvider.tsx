import { Messages, i18n } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { getLanguage } from 'interface/selectors/language';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { en, de, es, fr, it, ko, pl, pt, ru, zh } from 'make-plural/plurals';
import { ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

i18n.loadLocaleData('en', { plurals: en });
i18n.loadLocaleData('de', { plurals: de });
i18n.loadLocaleData('es', { plurals: es });
i18n.loadLocaleData('fr', { plurals: fr });
i18n.loadLocaleData('it', { plurals: it });
i18n.loadLocaleData('ko', { plurals: ko });
i18n.loadLocaleData('pl', { plurals: pl });
i18n.loadLocaleData('pt', { plurals: pt });
i18n.loadLocaleData('ru', { plurals: ru });
i18n.loadLocaleData('zh', { plurals: zh });

const loadCatalog = (locale: string): Promise<{ messages: Messages }> =>
  process.env.NODE_ENV !== 'production'
    ? import(
        /* webpackMode: "lazy", webpackChunkName: "i18n-[request]" */ `@lingui/loader!./${locale}/messages.json?as-js`
      )
    : import(
        /* webpackMode: "lazy", webpackChunkName: "i18n-[request]" */ `./${locale}/messages.js`
      );

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
      .then(({ messages }) => {
        i18n.load(locale, messages);
        i18n.activate(locale);
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
