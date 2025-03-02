import type { Boss } from 'game/raids';

import Headshot from './images/BlackhornHeadshot.jpg';
import Background from './images/Blackhorn.jpg';

const Blackhorn: Boss = {
  id: 1298,
  name: 'Warmaster Blackhorn',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_blackhorn.jpg',
  fight: {
    timeline: {
      abilities: [
        {
          // Twilight Onslaught
          id: 107588,
          type: 'begincast',
        },
        {
          // Disrupting Roar
          id: 108044,
          type: 'cast',
        },
      ],
    },
  },
};

export default Blackhorn;
