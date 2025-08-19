import type { Boss } from 'game/raids';

import Headshot from './images/BladeLordTayakHeadshot.jpg';
import Background from './images/BladeLordTayak.jpg';

const BladeLordTayak: Boss = {
  id: 1504,
  name: "Blade Lord Ta'yak",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid03',
  fight: {
    timeline: {
      abilities: [
        {
          id: 123175, // Wind Step (cast, not damage)
          type: 'cast',
        },
        {
          id: 125310, // Blade Tempest (cast)
          type: 'cast',
        },
      ],
      debuffs: [],
    },
  },
};

export default BladeLordTayak;
