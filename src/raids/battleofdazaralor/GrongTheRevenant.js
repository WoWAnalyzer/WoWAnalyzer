import Background from './images/backgrounds/GrongTheRevenant.jpg';
import Headshot from './images/headshots/GrongTheRevenant.png';

export default {
  id: 2284,
  name: 'Grong the Revenant', // Alliance only
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_grongrevenant',
  fight: {
    vantusRuneBuffId: 289194,
    softMitigationChecks: {
      physical: [
        283078, // Bestial Smash
      ],
      magical: [],
    },
  },
};
