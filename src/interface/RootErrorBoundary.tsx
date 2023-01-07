import { t, Trans } from '@lingui/macro';
import FullscreenError from 'interface/FullscreenError';
import ApiDownBackground from 'interface/images/api-down-background.gif';
import { useRouteError } from 'react-router-dom';

import { EventsParseError } from './report/hooks/useEventParser';

// Some errors are triggered by third party scripts, such as browser plug-ins. These errors should generally not affect the application, so we can safely ignore them for our error handling. If a plug-in like Google Translate messes with the DOM and that breaks the app, that triggers a different error so those third party issues are still handled.
const RootErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof EventsParseError) {
    return (
      <FullscreenError
        error={t({
          id: 'interface.rootErrorBoundary.errorDuringAnalysis',
          message: `An error occurred during analysis`,
        })}
        details={t({
          id: 'interface.rootErrorBoundary.errorDuringAnalysisDetails',
          message: `We ran into an error while looking at your gameplay and running our analysis. Please let us know on Discord and we will fix it for you.`,
        })}
        background="https://media.giphy.com/media/2sdHZ0iBuI45s6fqc9/giphy.gif"
      />
    );
  }

  // TODO: Instead of hiding the entire app, show a small toaster instead. Not all uncaught errors are fatal.
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
        error instanceof Error ? (
          <>
            <p>{error.message}</p>
            <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              {error.stack}
            </pre>
          </>
        ) : undefined
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

export default RootErrorBoundary;
