import Expansion from 'game/Expansion';
import { type Raid } from 'game/raids';
import { type CSSProperties } from 'react';
import styles from './HeaderBackground.module.scss';

interface Props {
  boss:
    | {
        background?: string;
      }
    | undefined
    | null;
  raid?: Raid;
  expansion: Expansion;
}

const getFallbackImage = (expansion: Expansion) => {
  switch (expansion) {
    case Expansion.TheBurningCrusade:
      return '/img/headertbc.jpg';
    default:
      return '/img/header.jpg';
  }
};

const HeaderBackground = ({ boss, expansion, raid }: Props) => {
  const backgroundImage = boss?.background ?? raid?.background ?? getFallbackImage(expansion);
  const backgroundStyle = {
    '--header-background-image': `url(${backgroundImage})`,
  } as CSSProperties;

  return <div className={styles.backgroundContainer} style={backgroundStyle} />;
};

export default HeaderBackground;
