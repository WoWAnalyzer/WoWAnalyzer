import type { Boss } from 'game/raids';

import Headshot from './images/YorsahjHeadshot.jpg';
import Background from './images/Yorsahj.jpg';

const Yorsahj: Boss = {
  id: 1295,
  name: "Yor'sahj the Unsleeping",
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_yorsahj.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Acidic Vapors -- cast when an orb spawns
          id: 103968,
          type: 'cast',
        },
      ],
      debuffs: [
        {
          // Digestive Acid -- spread debuff
          id: 105573,
          type: 'debuff',
        },
      ],
    },
  },
};

export default Yorsahj;
