import React from 'react';
import PropTypes from 'prop-types';

import GitHubIcon from 'Interface/Icons/GitHubMarkSmall';

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
