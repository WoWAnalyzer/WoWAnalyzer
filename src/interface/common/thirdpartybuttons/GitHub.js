import React from 'react';
import PropTypes from 'prop-types';

import GitHubIcon from 'interface/icons/GitHubMarkSmall';

import './ThirdPartyButtons.css';

const GithubButton = ({ text, ...others }) => (
  <a
    className="btn github"
    role="button"
    href="https://github.com/WoWAnalyzer/WoWAnalyzer"
    {...others}
  >
    <GitHubIcon /> {text}
  </a>
);
GithubButton.propTypes = {
  text: PropTypes.string,
};
GithubButton.defaultProps = {
  text: 'View on GitHub',
};

export default GithubButton;
