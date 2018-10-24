import Background from './images/Backgrounds/MOTHER.jpg';
import Headshot from './images/Headshots/MOTHER.png';

export default {
  id: 2141,
  name: 'MOTHER',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_mother',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: [
      267787, // SanitizingStrike
    ],
  },
};
