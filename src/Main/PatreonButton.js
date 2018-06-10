import React from 'react';
import PropTypes from 'prop-types';

import PatreonIcon from 'Icons/PatreonTiny';

const PatreonButton = ({ text, ...others }) => (
  <a
    className="btn patreon"
    role="button"
    href="https://www.patreon.com/wowanalyzer"
    {...others}
  >
    <PatreonIcon />
    {' '}{text}
  </a>
);
PatreonButton.propTypes = {
  text: PropTypes.string,
};
PatreonButton.defaultProps = {
  text: 'Become a Patron',
};

export default PatreonButton;
