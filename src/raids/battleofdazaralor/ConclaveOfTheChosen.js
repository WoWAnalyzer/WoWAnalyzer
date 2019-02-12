import Background from './images/backgrounds/ConclaveOfTheChosen.jpg';
import Headshot from './images/headshots/ConclaveOfTheChosen.png';

export default {
  id: 2268,
  name: 'Conclave of the Chosen',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_loacouncil',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [
        282411, // Thundering Storm
      ],
    },
  },
};
