import React from 'react';
import PropTypes from 'prop-types';

import DiscordLogo from './Images/Discord-Logo+Wordmark-White.svg';

const DiscordButton = ({ style }) => (
  <a
    className="btn discord"
    role="button"
    href="https://discord.gg/AxphPxU"
    style={style}
  >
    <img src={DiscordLogo} alt="Discord logo" style={{ height: '2em', marginTop: -1 }} />
  </a>
);
DiscordButton.propTypes = {
  style: PropTypes.object,
};

export default DiscordButton;
