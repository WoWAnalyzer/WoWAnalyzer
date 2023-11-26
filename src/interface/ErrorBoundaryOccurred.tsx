import { Trans } from '@lingui/macro';
import FullscreenError from 'interface/FullscreenError';
import ApiDownBackground from 'interface/images/api-down-background.gif';
import React from 'react';

type Props = {
  error: Error;
  errorDetails?: string;
};

const ErrorBoundaryOccurred: React.FC<Props> = ({ error, errorDetails }) => {
  return (
    <FullscreenError
      error={<Trans id="interface.rootErrorBoundary.errorOccurred">An error occurred.</Trans>}
      details={
        <Trans id="interface.rootErrorBoundary.errorOccurredDetails">
          An unexpected error occurred in the app. Please try again.
        </Trans>
      }
      background={ApiDownBackground}
      errorDetails={
        <>
          <p>{error.message}</p>
          <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            {error.stack}
          </pre>
          {errorDetails && <pre style={{ color: 'red' }}>{errorDetails}</pre>}
        </>
      }
    >
      <div className="text-muted">
        <Trans id="interface.rootErrorBoundary.bug">
          This is usually caused by a bug, please let us know about the issue on GitHub or Discord
          so we can fix it.
        </Trans>
      </div>
    </FullscreenError>
  );
};

export default ErrorBoundaryOccurred;
