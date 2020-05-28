import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/Vexiona.jpg';
import Headshot from './images/headshots/Vexiona.png';

export default {
  id: 2336,
  name: 'Vexiona',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_vexiona',
  fight: {
    vantusRuneBuffId: 306479,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Cult of the Void',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Death From Above',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Cast,
          ability: {
            id: SPELLS.POWER_OF_THE_CHOSEN.id,
          },
        },
      },
      P3: {
        name: 'Stage 3: The Void Unleashed',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 157354,
          health: 40,
          eventInstance: 0,
        },
      },
    },
  },
};
