import type { Boss } from 'game/raids';

import Headshot from './images/TheStoneGuardHeadshot.jpg';
import Background from './images/StoneGuard.jpg';

const TheStoneGuard: Boss = {
  id: 1395,
  name: 'The Stone Guard',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_moguraid_01',
  fight: {
    timeline: {
      debuffs: [
        {
          id: 130404, // Jasper Chains
        },
        {
          id: 116281, // Cobalt Mine Blast (root)
        },
        {
          id: 116199, // Living Cobalt
        },
        {
          id: 116301, // Living Jade
        },
        {
          id: 116304, // Living Jasper
        },
        {
          id: 116322, // Living Amethyst
        },
        {
          id: 115877, // Fully Petrified
        },
      ],
      abilities: [
        {
          id: 115840, // Cobalt Overload,
          type: 'cast',
        },
        {
          id: 115842, // Jade Overload
          type: 'cast',
        },
        {
          id: 115844, // Amethyst Overload
          type: 'cast',
        },
        {
          id: 115843, // Jasper Overload
          type: 'cast',
        },
      ],
    },
  },
};

export default TheStoneGuard;
