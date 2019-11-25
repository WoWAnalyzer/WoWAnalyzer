import React from 'react';
import PropTypes from 'prop-types';

import DiscordLogo from 'interface/icons/Discord';

import './ThirdPartyButtons.css';

const DiscordButton = ({ style }) => (
  <a
    className="btn discord"
    role="button"
    href="https://discord.gg/AxphPxU"
    style={style}
  >
    <DiscordLogo />
  </a>
);
DiscordButton.propTypes = {
  style: PropTypes.object,
};

export default DiscordButton;
