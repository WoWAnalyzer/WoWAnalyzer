import type { Boss } from 'game/raids';

import Headshot from './images/HagaraHeadshot.jpg';
import Background from './images/Hagara.jpg';

const Hagara: Boss = {
  id: 1296,
  name: 'Hagara the Stormbinder',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_hagara.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Water Shield
          id: 105409,
          type: 'cast',
        },
        {
          // Frozen Tempest
          id: 105256,
          type: 'cast',
        },
        {
          // Ice Tomb
          id: 104448,
          type: 'cast',
        },
      ],
      debuffs: [
        {
          // Ice Tomb
          id: 104451,
          type: 'debuff',
        },
      ],
    },
  },
};

export default Hagara;
