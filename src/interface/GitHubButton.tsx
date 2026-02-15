import GitHubIcon from 'interface/icons/GitHubMarkSmall';
import type { HTMLAttributes } from 'react';

import './ThirdPartyButtons.css';

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  text?: string;
}

const GithubButton = ({ text = 'View source on GitHub', ...others }: Props) => (
  <a
    className="btn github"
    role="button"
    href="https://github.com/WoWAnalyzer/WoWAnalyzer"
    {...others}
  >
    <GitHubIcon /> {text}
  </a>
);

export default GithubButton;
