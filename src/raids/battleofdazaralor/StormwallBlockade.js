import Background from './images/backgrounds/JainaProudmoore.jpg';
import Headshot from './images/headshots/JainaProudmoore.png';

export default {
  id: 2280,
  name: 'Stormwall Blockade', // Horde
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_blockade',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};
