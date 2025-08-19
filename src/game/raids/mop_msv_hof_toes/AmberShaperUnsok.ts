import type { Boss } from 'game/raids';

import Headshot from './images/AmberShaperUnsokHeadshot.jpg';
import Background from './images/AmberShaperUnsok.jpg';

const AmberShaperUnsok: Boss = {
  id: 1499,
  name: "Amber-Shaper Un'sok",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid06',
  fight: {
    timeline: {
      abilities: [
        {
          id: 122784, // Reshape Life
          type: 'cast',
        },
        {
          id: 121994, // Amber Scalpel
          type: 'cast',
        },
        {
          id: 122547, // Draw Power (p3 start)
          type: 'cast',
        },
        {
          id: 122540, // Amber Carapace (p2 start)
          type: 'cast',
        },
      ],
      debuffs: [
        {
          id: 122370, // Reshape Life (construct form)
        },
      ],
    },
  },
};

export default AmberShaperUnsok;
