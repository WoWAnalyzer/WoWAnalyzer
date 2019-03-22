import Background from './images/backgrounds/JadefireMastersH.jpg';
import Headshot from './images/headshots/JadefireMastersH.png';

// aka Jadefire Masters (H)
export default {
  id: 2266,
  name: 'Jadefire Masters', // Horde - Flamefist and the Illuminated
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_manceroy_mestrah',
  fight: {
    vantusRuneBuffId: 285537,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    resultsWarning: 'Logs recorded for this fight contain many issues that may make analysis inaccurate. Please consider analyzing a different fight.',
  },
};
