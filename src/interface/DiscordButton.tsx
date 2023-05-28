import { CSSProperties } from 'react';
import DiscordLogo from 'interface/icons/Discord';

import './ThirdPartyButtons.css';

interface DiscordButtonProps {
  style?: CSSProperties;
}
const DiscordButton = ({ style }: DiscordButtonProps) => (
  <a className="btn discord" role="button" href="https://discord.gg/AxphPxU" style={style}>
    <DiscordLogo />
  </a>
);

export default DiscordButton;
