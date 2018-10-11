import Background from './images/Backgrounds/Aggramar.jpg';
import Headshot from './images/Headshots/Aggramar.png';

export default {
  id: 2135,
  name: 'Mythrax the Unraveler',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_mythraxtheunraveler',
  fight: {
    // vantusRuneBuffId: ,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      EssenceShear: 273282,
    },
  },
};
