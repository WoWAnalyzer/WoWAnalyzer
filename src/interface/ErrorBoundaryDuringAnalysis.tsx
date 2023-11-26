import { t } from '@lingui/macro';
import FullscreenError from 'interface/FullscreenError';
import React from 'react';

const ErrorBoundaryDuringAnalysis: React.FC = () => {
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
};

export default ErrorBoundaryDuringAnalysis;
