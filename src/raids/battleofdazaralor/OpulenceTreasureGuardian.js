import Background from './images/backgrounds/OpulenceTreasureGuardian.jpg';
import Headshot from './images/headshots/OpulenceTreasureGuardian.png';

export default {
  id: 2271,
  name: 'Opulence Treasure Guardian', // Alliance
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_treasuregolem',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [
        287037, // Coin Sweep
      ],
      magical: [],
    },
  },
};
