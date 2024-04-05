import type { Boss } from 'game/raids';
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
    resultsWarning: 'Use the Phase filter at the top left to analyze Razorscale only.',
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Air Phase',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Ground Phase (Razorscale)',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.Health,
          guid: 33186, // Razorscale
          health: 99.99,
        },
      },
    },
  },
};

export default Razorscale;
