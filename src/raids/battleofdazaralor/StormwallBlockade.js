import Background from './images/backgrounds/StormwallBlockade.jpg';
import Headshot from './images/headshots/StormwallBlockade.png';
import { BOD_ALLIANCE_TO_HORDE } from './RaceTranslation';

export default {
  id: 2280,
  name: 'Stormwall Blockade', // Horde
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_blockade',
  fight: {
    vantusRuneBuffId: 285542,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    raceTranslation: BOD_ALLIANCE_TO_HORDE,
  },
};
