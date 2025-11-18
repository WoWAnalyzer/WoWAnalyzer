import styled from '@emotion/styled';
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

const BackgroundContainer = styled.div<{ url: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  min-height: 1000px;
  z-index: -1000;

  background-repeat: no-repeat;
  filter: blur(4px);
  background-size: cover;
  background-image: linear-gradient(
      to right,
      hsla(44, 7%, 8%, 1) 0%,
      hsla(44, 7%, 8%, 0.75) 10%,
      hsla(44, 7%, 8%, 0.75) 90%,
      hsla(44, 7%, 8%, 1) 100%
    ),
    linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 70%, hsla(44, 7%, 8%, 1) 100%),
    url(${(props) => props.url});
`;

const HeaderBackground = ({ boss, expansion, raid }: Props) => {
  const backgroundImage = boss?.background ?? raid?.background ?? getFallbackImage(expansion);

  return <BackgroundContainer url={backgroundImage} />;
};

export default HeaderBackground;
