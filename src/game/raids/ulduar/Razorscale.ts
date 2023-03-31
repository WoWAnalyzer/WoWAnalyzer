import { Boss } from 'game/raids';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Headshot from './images/RazorscaleHeadshot.jpg';
import Background from './images/Razorscale.jpg';

const Razorscale: Boss = {
  id: 746,
  name: 'Razorscale',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_razorscale',
  fight: {
    phases: {
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: Razorscale',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.Health,
          guid: 33186, // Razorscale
          health: 99.9,
        },
      },
    },
  },
};

export default Razorscale;
