import Background from './images/Backgrounds/Taloc.jpg';
import Headshot from './images/Headshots/Taloc.png';

export default {
  id: 2144,
  name: 'Taloc',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_talocthecorrupted',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      CudgelOfGore: 271811,
    },
  },
};
