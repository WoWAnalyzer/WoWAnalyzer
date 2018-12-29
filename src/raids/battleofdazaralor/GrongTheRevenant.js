// import Background from './images/backgrounds/FridaIronbellows.jpg';
// import Headshot from './images/headshots/FridaIronbellows.png';

export default {
  id: 2340,
  name: 'Grong the Revenant', // Alliance only
  // TODO: background: Background,
  // TODO: headshot: Headshot,
  icon: 'achievement_boss_zuldazar_grongrevenant',
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
