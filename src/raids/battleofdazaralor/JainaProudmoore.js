// import Background from './images/backgrounds/FridaIronbellows.jpg';
// import Headshot from './images/headshots/FridaIronbellows.png';

export default {
  id: 2343,
  name: 'Jaina Proudmoore', // Horde
  // TODO: background: Background,
  // TODO: headshot: Headshot,
  icon: 'achievement_boss_zuldazar_jaina',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [
        287565, // Avalanche
      ],
    },
  },
};
