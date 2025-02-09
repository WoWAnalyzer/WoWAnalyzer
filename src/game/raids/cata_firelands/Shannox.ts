import type { Boss } from 'game/raids';

import Headshot from './images/ShannoxHeadshot.jpg';
// import Background from './images/Shannox.jpg';
import Background from './images/CataImpossibleOdds.jpg';

const Shannox: Boss = {
  id: 1205,
  name: 'Shannox',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_shannox.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Face Rage
          id: 99947,
          type: 'cast',
        },
        {
          // Magma Rupture
          id: 100003,
          type: 'cast',
        },
      ],
      debuffs: [
        {
          // Face Rage (stun)
          id: 99947,
        },
      ],
    },
  },
};

export default Shannox;
