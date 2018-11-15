import Background from './images/backgrounds/Varimathras.jpg';
import Headshot from './images/headshots/Varimathras.png';

export default {
  id: 2069,
  name: 'Varimathras',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_varimathras',
  fight: {
    vantusRuneBuffId: 250165,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: [
      243960, // ShadowStrike
      257644, // ShadowStrikeN - N difficulty Shadow Strike that does not cleave.
    ],
  },
};
