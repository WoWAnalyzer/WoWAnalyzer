import React from 'react';

import DiscordLogo from './Images/Discord-Logo+Wordmark-White.svg';

const DiscordButton = () => (
  <a
    className="btn discord"
    role="button"
    href="https://discord.gg/AxphPxU"
  >
    <img src={DiscordLogo} alt="Discord logo" style={{ height: '2em', marginTop: -1 }} />
  </a>
);

export default DiscordButton;
