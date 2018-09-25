import Background from './Images/Backgrounds/Zul.jpg';
import Headshot from './Images/Headshots/Zul.png';

export default {
  id: 2145,
  name: 'Zul',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_zul',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
    },
  },
};
