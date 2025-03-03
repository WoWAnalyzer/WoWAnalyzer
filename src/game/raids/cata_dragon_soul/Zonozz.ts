import type { Boss } from 'game/raids';

import Headshot from './images/ZonozzHeadshot.jpg';
import Background from './images/Zonozz.jpg';

const Zonozz: Boss = {
  id: 1294,
  name: "Warlord Zon'ozz",
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_zonozz.jpg',
  fight: {
    timeline: {
      abilities: [
        // Black Blood of Go'rath
        { id: 104378, type: 'cast' },
      ],
    },
  },
};

export default Zonozz;
