import Background from './images/Backgrounds/Vectis.jpg';
import Headshot from './images/Headshots/Vectis.png';

export default {
  id: 2134,
  name: 'Vectis',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_bloodofghuun',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};
