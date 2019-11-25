import Background from './images/backgrounds/TheRestlessCabal.jpg';
import Headshot from './images/headshots/TheRestlessCabal.png';

export default {
  id: 2269,
  name: 'The Restless Cabal',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_restlesscabal',
  fight: {
    vantusRuneBuffId: 285900,
    softmitigationChecks: {
      physical: [
        282384, //Shear Mind
      ],
      magical: [],
    },
  },
};
