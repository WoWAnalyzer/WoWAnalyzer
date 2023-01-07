import App from 'interface/App';
import RootErrorBoundary from 'interface/RootErrorBoundary';
import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import I18nProvider from './localization/I18nProvider';
import store from './store';

interface Props {
  children?: ReactNode;
}

const Root = ({ children }: Props) => (
  <ReduxProvider store={store}>
    <I18nProvider>
      {/* We need to place the error boundary inside all providers since it uses i18n for localized messages. */}
      <RootErrorBoundary>
        <BrowserRouter>{children || <App />}</BrowserRouter>
      </RootErrorBoundary>
    </I18nProvider>
  </ReduxProvider>
);

export default Root;
