import Background from './images/backgrounds/FridaIronbellows.jpg';
import Headshot from './images/headshots/FridaIronbellows.png';

// aka Champion of the Light (H)
export default {
  id: 2265,
  name: 'Frida Ironbellows', // Horde
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_fridaironbellows',
  fight: {
    vantusRuneBuffId: 285535,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};
