import type { Boss } from 'game/raids';

import Headshot from './images/DeathwingMadnessHeadshot.jpg';
import Background from './images/Madness.jpg';

const DeathwingMadness: Boss = {
  id: 1299,
  name: 'Madness of Deathwing',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_madnessofdeathwing.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Cataclysm
          id: 106523,
          type: 'begincast',
        },
        {
          // Agonizing Pain (interrupted Cataclysm)
          id: 106548,
          type: 'cast',
        },
      ],
    },
  },
};

export default DeathwingMadness;
