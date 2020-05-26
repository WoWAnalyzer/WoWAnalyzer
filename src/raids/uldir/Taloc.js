import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/Backgrounds/Taloc.jpg';
import Headshot from './images/Headshots/Taloc.png';

export default {
  id: 2144,
  name: 'Taloc',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_talocthecorrupted',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [
        271811, // Cudgel of Gore
      ],
    },
    phases: {
      P1: {
        name: 'Stage One: The Corrupted Construct',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage Two: Ruin\'s Descent',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.TALOC_POWERED_DOWN.id,
          },
        },
      },
      P3: {
        name: 'Stage Three: The Bottom Floor',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.TALOC_POWERED_DOWN.id,
          },
        },
      },
    },
  },
};
