import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/RadenTheDespoiled.jpg';
import Headshot from './images/headshots/RadenTheDespoiled.png';

export default {
  id: 2331,
  name: 'Ra-den the Despoiled',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_raden',
  fight: {
    vantusRuneBuffId: 313550,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Gathering Power',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Unleashed Wrath',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 156866,
          health: 40,
          eventInstance: 0,
        },
      },
    },
  },
};
