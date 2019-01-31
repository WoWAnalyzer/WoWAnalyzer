import Background from './images/backgrounds/KingRastakhan.jpg';
import Headshot from './images/headshots/KingRastakhan.png';

export default {
  id: 2272,
  name: 'King Rastakhan', // Alliance
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_zuldazar_rastakhan',
  fight: {
    // TODO: Add vantusRuneBuffId: 250144,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
  },
};
