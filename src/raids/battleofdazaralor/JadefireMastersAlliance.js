import Background from './images/backgrounds/JadefireMastersA.jpg';
import Headshot from './images/headshots/JadefireMastersA.png';

// aka Jadefire Masters (A)
export default {
  id: 2285,
  name: 'Jadefire Masters - Grimfang and Firecaller', // Alliance
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_grimfang_anathos',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    resultsWarning: 'Logs recorded for this fight contain many issues that may make analysis inaccurate. Please consider analyzing a different fight.',
  },
};
