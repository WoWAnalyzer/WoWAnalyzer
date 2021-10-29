import PatreonIcon from 'interface/icons/PatreonTiny';
import React from 'react';

interface Props {
  text?: string;
}

const PatreonButton = ({ text = 'Become a Patron', ...others }: Props) => (
  <a
    className="btn patreon"
    role="button"
    href="https://www.patreon.com/join/wowanalyzer"
    {...others}
  >
    <PatreonIcon /> {text}
  </a>
);

export default PatreonButton;
