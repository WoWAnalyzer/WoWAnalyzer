import type { Boss } from 'game/raids';

import Headshot from './images/TsulongHeadshot.jpg';
import Background from './images/Tsulong.jpg';

const Tsulong: Boss = {
  id: 1505,
  name: 'Tsulong',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_terraceofendlessspring02',
  fight: {
    timeline: {
      debuffs: [
        {
          // The Light of Day
          id: 123716,
        },
        {
          // Bathed in Light
          id: 122858,
        },
        {
          // Fright
          id: 123036,
        },
      ],
    },
  },
};

export default Tsulong;
