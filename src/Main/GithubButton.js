import React from 'react';
import PropTypes from 'prop-types';

import GithubLogo from './Images/GitHub-Mark-32px.png';

const GithubButton = ({ text, ...others }) => (
  <a
    className="btn github"
    role="button"
    href="https://github.com/WoWAnalyzer/WoWAnalyzer"
    {...others}
  >
    <img src={GithubLogo} alt="GitHub logo" style={{ height: '1.4em', marginTop: -2 }} /> {text}
  </a>
);
GithubButton.propTypes = {
  text: PropTypes.string,
};
GithubButton.defaultProps = {
  text: 'View on GitHub',
};

export default GithubButton;
