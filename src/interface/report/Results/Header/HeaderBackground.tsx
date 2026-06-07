import cssComponent from "interface/utils/css-component";
import styles from "./HeaderBackground.module.scss";
import Expansion from 'game/Expansion';
import { type Raid } from 'game/raids';

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

const BackgroundContainer = cssComponent("div", styles.BackgroundContainer, ["url"] as const);

const HeaderBackground = ({ boss, expansion, raid }: Props) => {
  const backgroundImage = boss?.background ?? raid?.background ?? getFallbackImage(expansion);

  return <BackgroundContainer url={backgroundImage} />;
};

export default HeaderBackground;
