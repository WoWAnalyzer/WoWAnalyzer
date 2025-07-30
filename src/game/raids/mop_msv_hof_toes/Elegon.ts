import type { Boss } from 'game/raids';

import Headshot from './images/ElegonHeadshot.jpg';
import Background from './images/Elegon.jpg';

const Elegon: Boss = {
  id: 1500,
  name: 'Elegon',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_05',
  fight: {
    timeline: {
      debuffs: [
        {
          id: 117870, // Touch of the Titans -- damage buff
        },
      ],
      abilities: [
        {
          id: 124967, // Draw Power
          type: 'cast',
        },
        {
          id: 116994, // Unstable Energy
          type: 'cast',
        },
      ],
    },
  },
};

export default Elegon;
