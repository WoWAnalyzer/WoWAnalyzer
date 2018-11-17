import Background from './images/Backgrounds/Ghuun.jpg';
import Headshot from './images/Headshots/Ghuun.png';
import './Ghuun.css';

export default {
  id: 2122,
  name: 'G\'huun',
  background: Background,
  backgroundPosition: 'center center',
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
