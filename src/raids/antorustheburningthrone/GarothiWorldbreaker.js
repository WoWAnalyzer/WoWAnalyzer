import Background from './images/backgrounds/Garothi-Worldbreaker.jpg';
import Headshot from './images/headshots/Garothi-Worldbreaker.png';

export default {
  id: 2076,
  name: 'Garothi Worldbreaker',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_felreaver',
  fight: {
    vantusRuneBuffId: 250153,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {},
  },
};
