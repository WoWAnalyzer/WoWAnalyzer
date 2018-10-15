import Background from './images/Backgrounds/Aggramar.jpg';
import Headshot from './images/Headshots/Aggramar.png';

export default {
  id: 2122,
  name: 'G\'huun',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_ghuun',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: [
      267412, // MassiveSmash
    ],
  },
};
