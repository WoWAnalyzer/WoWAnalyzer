import ActivityIndicator from 'interface/ActivityIndicator';
import FullscreenError from 'interface/FullscreenError';
import { type ReactNode, useEffect, useState } from 'react';
import { processWclCallback } from 'report-data/wcl/WclSession';

export default function WclOAuthCallbackGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | Error>('loading');

  useEffect(() => {
    let active = true;
    processWclCallback()
      .then((result) => {
        if (!active) return;
        if (result.handled) {
          const cleanUrl = `${window.location.pathname}${window.location.hash}`;
          window.history.replaceState(null, '', cleanUrl);
          if (result.returnTo) window.location.hash = result.returnTo;
        }
        setState('ready');
      })
      .catch((error: unknown) => {
        if (active) setState(error instanceof Error ? error : new Error(String(error)));
      });
    return () => {
      active = false;
    };
  }, []);

  if (state === 'loading') return <ActivityIndicator text="Completing Warcraft Logs sign-in..." />;
  if (state instanceof Error) {
    return (
      <FullscreenError
        error="Warcraft Logs sign-in failed"
        details={state.message}
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => (window.location.href = './')}
        >
          Return home
        </button>
      </FullscreenError>
    );
  }
  return children;
}
