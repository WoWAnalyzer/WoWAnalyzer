import Expansion from 'game/Expansion';
import { type Raid } from 'game/raids';

interface Props {
  boss:
    | {
        background?: string;
        backgroundPosition?: string;
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
  const backgroundPosition = boss?.backgroundPosition ?? 'center';

  return (
    <div className="background">
      <div
        className="img"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: backgroundPosition,
        }}
      />
    </div>
  );
};

export default HeaderBackground;
