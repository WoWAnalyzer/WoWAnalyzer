import Background from './Images/Backgrounds/Antoran-High-Command.jpg';
import Headshot from './Images/Headshots/Antoran-High-Command.png';

export default {
  id: 2070,
  name: 'Antoran High Command',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_maleeredar',
  fight: {
    vantusRuneBuffId: 250167,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
  },
};
