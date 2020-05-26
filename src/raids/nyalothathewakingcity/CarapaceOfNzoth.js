import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/CarapaceOfNzoth.jpg';
import Headshot from './images/headshots/CarapaceOfNzoth.png';

export default {
  id: 2337,
  name: 'Carapace of N\'Zoth',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_carapace',
  fight: {
    vantusRuneBuffId: 313554,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Exterior Carapace',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Subcutaneous Tunnel',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 157439,
          health: 50,
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Locus of Infinite Truth',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 157439,
          health: 40,
          eventInstance: 0,
        },
      },
    },
  },
};
