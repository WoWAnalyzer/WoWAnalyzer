// import Background from './images/backgrounds/FridaIronbellows.jpg';
import Headshot from './images/headshots/JainaProudmoore.jpg';
import BOD_HORDE_TO_ALLIANCE from 'RaceTranslation';

export default {
  id: 2281,
  name: 'Jaina Proudmoore', // Horde
  // TODO: background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_jaina',
  fight: {
    vantusRuneBuffId: 285543,
    softMitigationChecks: {
      physical: [],
      magical: [
        287565, // Avalanche
      ],
    },
    raceTranslation: BOD_HORDE_TO_ALLIANCE,
  },
};
