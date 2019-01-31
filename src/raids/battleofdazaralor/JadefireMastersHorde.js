import Background from './images/backgrounds/JadefireMastersH.jpg';
import Headshot from './images/headshots/JadefireMastersH.png';

// aka Jadefire Masters (H)
export default {
  id: 2266,
  name: 'Jadefire Masters - Flamefist and the Illuminated', // Horde
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_manceroy_mestrah',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};
