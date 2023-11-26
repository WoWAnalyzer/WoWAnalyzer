import WowErrorBoundary from 'interface/ErrorBoundary';
import React, { ReactNode, useState, useEffect } from 'react';
import { useErrorBoundary } from 'use-error-boundary';

import { EventsParseError } from './report/hooks/useEventParser';
import ErrorBoundaryDuringAnalysis from './ErrorBoundaryDuringAnalysis';
import ErrorBoundaryOccurred from './ErrorBoundaryOccurred';
import ignoreErrorBoundary from './utils/ignoreErrorBoundary';
import handleErrorEventBoundary from './utils/handleErrorEventBoundary';

interface Props {
  children: ReactNode;
}

const RootErrorBoundary: React.FC<Props> = ({ children }) => {
  const { ErrorBoundary, error } = useErrorBoundary();

  const [wowError, setWowError] = useState<Error>();
  const [errorDetails, setErrorDetails] = useState<string>();

  const handleErrorEvent = (event: ErrorEvent) => {
    const { wowError } = handleErrorEventBoundary(event);
    evaluateError(wowError, 'wowError');
  };
  const handleUnhandledrejectionEvent = (event: PromiseRejectionEvent) => {
    console.log('Caught a global unhandledrejection');
    evaluateError(event.reason, 'unhandledrejection');
  };

  const evaluateError = (wowError: Error | undefined, details?: string) => {
    if (!wowError || ignoreErrorBoundary(wowError)) {
      return;
    }

    (window.errors = window.errors || []).push(wowError);

    setWowError(wowError);
    setErrorDetails(details);
  };

  useEffect(() => {
    window.addEventListener('error', handleErrorEvent);
    window.addEventListener('unhandledrejection', handleUnhandledrejectionEvent);
    return () => {
      window.removeEventListener('error', handleErrorEvent);
      window.removeEventListener('unhandledrejection', handleUnhandledrejectionEvent);
    };
  });

  useEffect(() => {
    if (error) {
      evaluateError(error, 'useErrorBoundary');
    }
  }, [error]);

  if (wowError) {
    if (wowError instanceof EventsParseError) {
      return <ErrorBoundaryDuringAnalysis />;
    }
    // TODO: Instead of hiding the entire app, show a small toaster instead. Not all uncaught errors are fatal.
    return <ErrorBoundaryOccurred error={wowError} errorDetails={errorDetails} />;
  }
  return (
    <ErrorBoundary>
      <WowErrorBoundary>{children}</WowErrorBoundary>
    </ErrorBoundary>
  );
};

export default RootErrorBoundary;
