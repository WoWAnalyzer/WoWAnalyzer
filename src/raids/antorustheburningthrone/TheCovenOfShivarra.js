import Background from './images/backgrounds/The-Coven-of-Shivarra.jpg';
import Headshot from './images/headshots/The-Coven-of-Shivarra.png';

export default {
  id: 2073,
  name: 'The Coven of Shivarra',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_shivan',
  fight: {
    vantusRuneBuffId: 250163,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      FlashFreeze: 245518,
      FireyStrike: 244899,
    },
  },
};
