import React from 'react';
import PropTypes from 'prop-types';

import AppBackgroundImage from './AppBackgroundImage';
import DiscordButton from './DiscordButton';
import GithubButton from './GithubButton';
import PatreonButton from './PatreonButton';

const FullscreenError = ({ error, details, background, children }) => {
  // I want this to permanently block rendering since we need people to refresh to load the new version. If they don't refresh they might try requests that may not work anymore.
  // Do note there's another part to this page; below at AppBackgroundImage we're overriding the background image as well.
  return (
    <div className="container" style={{ fontSize: '2em' }}>
      <h1 style={{ fontSize: '4.5em', marginBottom: 0, marginTop: '1em' }}>{error}</h1>
      <div style={{ fontSize: '1.5em' }}>
        {details}
      </div>
      {children}
      <div style={{ marginTop: 30 }}>
        <DiscordButton />
        <GithubButton style={{ marginLeft: 20 }} />
        <PatreonButton style={{ marginLeft: 20 }} />
      </div>
      <AppBackgroundImage override={background} />
    </div>
  );
};
FullscreenError.propTypes = {
  error: PropTypes.node.isRequired,
  details: PropTypes.node.isRequired,
  background: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default FullscreenError;
