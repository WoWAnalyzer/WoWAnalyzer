import Background from './images/backgrounds/OpulenceTreasureGuardian.jpg';
import Headshot from './images/headshots/OpulenceTreasureGuardian.png';
import { BOD_HORDE_TO_ALLIANCE } from './RaceTranslation';

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
    raceTranslation: BOD_HORDE_TO_ALLIANCE,
  },
};
