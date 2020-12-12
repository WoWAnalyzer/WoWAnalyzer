import { Messages, i18n } from '@lingui/core'
import { I18nProvider as LinguiI18nProvider } from '@lingui/react'
import React, { ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux';

import { getLanguage } from 'interface/selectors/language';

const loadCatalog = (locale: string): Promise<{ messages: Messages }> =>
  process.env.NODE_ENV !== 'production'
    ? import(
        /* webpackMode: "lazy", webpackChunkName: "i18n-[request]" */ `@lingui/loader!./${locale}/messages.json`
      )
    : import(
        /* webpackMode: "lazy", webpackChunkName: "i18n-[request]" */ `./${locale}/messages.js`
      )

interface Props {
  children: ReactNode
}

const I18nProvider = ({ children }: Props) => {
  const locale = useSelector(state => getLanguage(state))
  const [activeLocale, setActiveLocale] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    if (activeLocale === locale) {
      return
    }

    loadCatalog(locale).then(({ messages }) => {
      i18n.load(locale, messages)
      i18n.activate(locale)
      setActiveLocale(locale)
    })
  }, [locale, activeLocale, setActiveLocale])

  if (!activeLocale && process.env.NODE_ENV !== 'test') {
    // Wait with rendering the app until we have the locale loaded. This reduces
    // the amount of significant screen updates, providing a better user
    // experience.
    return null
  }

  return (
    <LinguiI18nProvider i18n={i18n}>
      <Helmet>
        {/* Specify the correct language to disable translation plugins, and try to disable translation plugins. This is needed because they modify the DOM, which can cause React to crash. */}
        <html lang={activeLocale} translate="no" />
      </Helmet>

      {children}
    </LinguiI18nProvider>
  )
}

export default I18nProvider
