import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/UunatHarbingerOfTheVoid.jpg';
import Headshot from './images/headshots/UunatHarbingerOfTheVoid.png';

export default {
  id: 2273,
  name: 'Uu\'nat, Harbinger of the Void',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_uunat',
  fight: {
    vantusruneBuffId: 285901,
    softMitigationChecks: {
      physical: [],
      magical: [
        284851, // Touch of the End
      ],
    },
    phases: {
      P1: {
        name: 'Stage One: His All-Seeing Eyes',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      I1: {
        name: 'Intermission One',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.VOID_SHIELD.id,
          },
          eventInstance: 0,
        },
      },
      P2: {
        name: 'Stage Two: His Dutiful Servants',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.VOID_SHIELD.id,
          },
          eventInstance: 0,
        },
      },
      I2: {
        name: 'Intermission Two',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.VOID_SHIELD.id,
          },
          eventInstance: 1,
        },
      },
      P3: {
        name: 'Stage Three: His Unwavering Gaze',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.VOID_SHIELD.id,
          },
          eventInstance: 1,
        },
      },
    },
  },
};
