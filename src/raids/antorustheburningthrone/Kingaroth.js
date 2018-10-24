import Background from './images/backgrounds/Kingaroth.jpg';
import Headshot from './images/headshots/Kingaroth.png';

export default {
  id: 2088,
  name: 'Kin\'garoth',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_titanbuilder',
  fight: {
    vantusRuneBuffId: 250148,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: [
      254919, // ForgingStrike
    ],
  },
};
