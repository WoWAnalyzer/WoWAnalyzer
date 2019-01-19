// import Background from './images/backgrounds/FridaIronbellows.jpg';
import Headshot from './images/headshots/GrongTheJungleLord.jpg';

export default {
  id: 2263,
  name: 'Grong, the Jungle Lord', // Horde
  // TODO: background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_grong',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [
        283078, // Bestial Smash
      ],
      magical: [],
    },
  },
};
