import type { Boss } from 'game/raids';

import Headshot from './images/UltraxionHeadshot.jpg';
import Background from './images/Ultraxion.jpg';

const Ultraxion: Boss = {
  id: 1297,
  name: 'Ultraxion',
  background: Background,
  headshot: Headshot,
  icon: 'achievment_boss_ultraxion.jpg',
  fight: {
    resultsWarning:
      'Heroic Will causes issues with logged buffs. Analyzing other fights is recommended.',
    timeline: {
      abilities: [
        {
          // Hour of Twilight
          id: 106371,
          type: 'begincast',
        },
      ],
      debuffs: [
        {
          // Fading Light - Non-Tank
          id: 109075,
          type: 'debuff',
        },
        {
          // Fading Light - Tank
          id: 105925,
          type: 'debuff',
        },
        {
          // Heroic Will
          id: 106108,
          type: 'debuff',
        },
      ],
    },
  },
};

export default Ultraxion;
