import Background from './Images/Backgrounds/Aggramar.jpg';
import Headshot from './Images/Headshots/Aggramar.png';

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
      TerribleThrash: 262277,
    },
  },
};
