import type { Boss } from 'game/raids';

import Headshot from './images/LeiShiHeadshot.jpg';
import Background from './images/LeiShi.jpg';

const LeiShi: Boss = {
  id: 1506,
  name: 'Lei Shi',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_terraceofendlessspring03',
  fight: {
    timeline: {
      abilities: [
        {
          // Hide
          id: 123244,
          type: 'cast',
        },
        {
          // Protect
          id: 123250,
          type: 'cast',
        },
        {
          // Get Away!
          id: 123461,
          type: 'cast',
        },
      ],
    },
  },
};

export default LeiShi;
