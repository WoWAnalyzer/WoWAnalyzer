// import Background from './images/backgrounds/FridaIronbellows.jpg';
// import Headshot from './images/headshots/FridaIronbellows.png';

export default {
  id: 2330,
  name: 'Conclave of the Chosen', // Alliance only
  // TODO: background: Background,
  // TODO: headshot: Headshot,
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
