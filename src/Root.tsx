import App from 'interface/App';
import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';

import I18nProvider from './localization/I18nProvider';

interface Props {
  children?: ReactNode;
}

const Root = ({ children }: Props) => (
  <ReduxProvider store={store}>
    <I18nProvider>{children ?? <App />}</I18nProvider>
  </ReduxProvider>
);

export default Root;
