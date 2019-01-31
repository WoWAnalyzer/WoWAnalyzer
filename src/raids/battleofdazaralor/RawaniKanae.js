import Background from './images/backgrounds/RawaniKanae.jpg';
import Headshot from './images/headshots/RawaniKanae.png';

// aka Champion of the Light (A)
export default {
  id: 2265,
  name: 'Ra\'wani Kanae', // Alliance
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_ralokar',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};
