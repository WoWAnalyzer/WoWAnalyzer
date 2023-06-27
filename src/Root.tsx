import App from 'interface/App';
import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';
import RootErrorBoundary from 'interface/RootErrorBoundary';

interface Props {
  children?: ReactNode;
}

const Root = ({ children }: Props) => (
  <ReduxProvider store={store}>
    {/* We need to place the error boundary inside all providers since it uses i18n for localized messages. */}
    <RootErrorBoundary>{children ?? <App />}</RootErrorBoundary>
  </ReduxProvider>
);

export default Root;
