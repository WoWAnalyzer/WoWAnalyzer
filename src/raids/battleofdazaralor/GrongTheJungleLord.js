// import Background from './images/backgrounds/FridaIronbellows.jpg';
// import Headshot from './images/headshots/FridaIronbellows.png';

export default {
  id: 2325,
  name: 'Grong, the Jungle Lord', // Horde
  // TODO: background: Background,
  // TODO: headshot: Headshot,
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
