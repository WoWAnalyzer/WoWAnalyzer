import Background from './images/backgrounds/ConclaveOfTheChosen.jpg';
import Headshot from './images/headshots/ConclaveOfTheChosen.png';
import { BOD_HORDE_TO_ALLIANCE } from './RaceTranslation';

export default {
  id: 2268,
  name: 'Conclave of the Chosen',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_loacouncil',
  fight: {
    vantusRuneBuffId: 285539,
    softMitigationChecks: {
      physical: [],
      magical: [
        282411, // Thundering Storm
      ],
    },
    raceTranslation: BOD_HORDE_TO_ALLIANCE,
  },
};
