import App from 'interface/App';
import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';
import RootErrorBoundary from 'interface/RootErrorBoundary';

import I18nProvider from './localization/I18nProvider';
import { HelmetProvider } from 'react-helmet-async';

interface Props {
  children?: ReactNode;
}

const Root = ({ children }: Props) => (
  <HelmetProvider>
    <ReduxProvider store={store}>
      <I18nProvider>
        {/* We need to place the error boundary inside all providers since it uses i18n for localized messages. */}
        <RootErrorBoundary>{children ?? <App />}</RootErrorBoundary>
      </I18nProvider>
    </ReduxProvider>
  </HelmetProvider>
);

export default Root;
