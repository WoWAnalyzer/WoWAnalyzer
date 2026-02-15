import DiscordButton from 'interface/DiscordButton';
import GithubButton from 'interface/GitHubButton';
import type { ReactNode } from 'react';

import AppBackgroundImage from './FullscreenErrorBackgroundImage';
import { useLingui } from '@lingui/react';
import { isMessageDescriptor } from 'localization/isMessageDescriptor';
import { MessageDescriptor } from '@lingui/core';

interface Props {
  error: ReactNode | MessageDescriptor;
  details: ReactNode | MessageDescriptor;
  children?: ReactNode;
  background: string;
  errorDetails?: ReactNode;
}

const FullscreenError = ({ error, details, background, children, errorDetails }: Props) => {
  const { i18n } = useLingui();

  const errorMessage = isMessageDescriptor(error) ? i18n.t(error) : error;
  const detailsMessage = isMessageDescriptor(details) ? i18n.t(details) : details;

  return (
    // I want this to permanently block rendering since we need people to refresh to load the new version. If they don't refresh they might try requests that may not work anymore.
    // Do note there's another part to this page; below at AppBackgroundImage we're overriding the background image as well.
    <div className="container" style={{ fontSize: '2em' }}>
      <h1
        style={{
          fontSize: 120,
          lineHeight: '85px',
          marginBottom: 0,
          marginTop: '1em',
        }}
      >
        {errorMessage}
      </h1>
      <div style={{ fontSize: '1.5em' }}>{detailsMessage}</div>
      {children}
      <div style={{ marginTop: 30 }}>
        <DiscordButton />
        <GithubButton style={{ marginLeft: 20 }} />
      </div>
      {errorDetails && <div style={{ marginTop: 30 }}>{errorDetails}</div>}
      <AppBackgroundImage image={background} />
    </div>
  );
};
export default FullscreenError;
