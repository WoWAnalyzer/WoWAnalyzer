import Background from './images/Backgrounds/FetidDevourer.jpg';
import Headshot from './images/Headshots/FetidDevourer.png';

export default {
  id: 2128,
  name: 'Fetid Devourer',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_fetiddevourer',
  fight: {
    // vantusRuneBuffId: ,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [
        262277, // Terrible Thrash
      ],
      magical: [],
    },
  },
};
