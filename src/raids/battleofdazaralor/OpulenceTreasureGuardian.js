// import Background from './images/backgrounds/FridaIronbellows.jpg';
// import Headshot from './images/headshots/FridaIronbellows.png';

export default {
  id: 2342,
  name: 'Opulence Treasure Guardian', // Alliance
  // TODO: background: Background,
  // TODO: headshot: Headshot,
  icon: 'achievement_boss_zuldazar_treasuregolem',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [
        287037, // Coin Sweep
      ],
      magical: [],
    },
  },
};
