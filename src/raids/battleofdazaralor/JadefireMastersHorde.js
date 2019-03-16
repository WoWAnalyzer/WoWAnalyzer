import Background from './images/backgrounds/JadefireMastersH.jpg';
import Headshot from './images/headshots/JadefireMastersH.png';

// aka Jadefire Masters (H)
export default {
  id: 2266,
  name: 'Jadefire Masters', // Horde
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_manceroy_mestrah',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    resultsWarning: 'Logs recorded for this fight contain many issues that may make analysis inaccurate. Please consider analyzing a different fight.',
  },
};
