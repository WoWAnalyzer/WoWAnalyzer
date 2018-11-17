import Background from './images/Backgrounds/Mythrax.jpg';
import Headshot from './images/Headshots/Mythrax.png';

export default {
  id: 2135,
  name: 'Mythrax the Unraveler',
  background: Background,
  backgroundPosition: 'center center',
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_mythraxtheunraveler',
  fight: {
    // vantusRuneBuffId: ,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: [
      273282, // EssenceShear
    ],
  },
};
