import type { Boss } from 'game/raids';

import Headshot from './images/DeathwingSpineHeadshot.jpg';
import Background from './images/Spine.jpg';

const DeathwingSpine: Boss = {
  id: 1291,
  name: 'Spine of Deathwing',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_spineofdeathwing.jpg',
  fight: {
    timeline: {
      debuffs: [
        {
          // Grasping Tendrils
          id: 105563,
          type: 'debuff',
        },
        {
          // Fiery Grip
          id: 105490,
          type: 'debuff',
        },
      ],
      abilities: [
        {
          // Nuclear Blast
          id: 105845,
          type: 'cast',
        },
        // Barrel Roll doesn't seem to log
      ],
    },
  },
};

export default DeathwingSpine;
