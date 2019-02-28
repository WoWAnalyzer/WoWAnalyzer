import Background from './images/backgrounds/HighTinkerMekkatorque.jpg';
import Headshot from './images/headshots/HighTinkerMekkatorque.png';
import { BOD_ALLIANCE_TO_HORDE } from './RaceTranslation';

export default {
  id: 2276,
  name: 'High Tinker Mekkatorque',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_mekkatorque',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    raceTranslation: BOD_ALLIANCE_TO_HORDE,
  },
};
