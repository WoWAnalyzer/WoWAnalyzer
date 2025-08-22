import type { Boss } from 'game/raids';

import Headshot from './images/GaralonHeadshot.jpg';
import Background from './images/Garalon.jpg';

const Garalon: Boss = {
  id: 1463,
  name: 'Garalon',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid05',
  fight: {
    timeline: {
      abilities: [
        {
          id: 122786, // Broken Leg
          type: 'cast',
        },
        {
          id: 123495, // Mend Leg
          type: 'cast',
        },
        {
          id: 122774, // Crush
          type: 'cast',
        },
      ],
      debuffs: [
        {
          id: 122835, // Pheromones
        },
      ],
    },
  },
};

export default Garalon;
