import Background from './images/backgrounds/KingRastakhan.jpg';
import Headshot from './images/headshots/KingRastakhan.png';
import { BOD_HORDE_TO_ALLIANCE } from './RaceTranslation';

export default {
  id: 2272,
  name: 'King Rastakhan', // Alliance
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_rastakhan',
  fight: {
    vantusRuneBuffId: 285540,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    raceTranslation: BOD_HORDE_TO_ALLIANCE,
  },
};
