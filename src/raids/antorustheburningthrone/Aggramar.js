import Background from './images/backgrounds/Aggramar.jpg';
import Headshot from './images/headshots/Aggramar.png';

export default {
  id: 2063,
  name: 'Aggramar',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_aggramar',
  fight: {
    vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      FoeBreaker: 244291,
      EmpoweredFoeBreaker: 255060,
    },
  },
};
