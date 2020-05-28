import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/Backgrounds/Zekvoz.jpg';
import Headshot from './images/Headshots/Zekvoz.png';

export const ENCOUNTER_EVENT = {
  id: 181089,
  name: "Encounter Event",
  icon: "inv_misc_questionmark",
};

export default {
  id: 2136,
  name: 'Zek\'voz',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_zekvoz',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [
        265237, // Shatter
      ],
      magical: [
        265264, // Void Lash
      ],
    },
    phases: {
      P1: {
        name: 'Stage One: Chaos',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID],
      },
      P1_M: {
        name: 'Stage One: Chaos and Deception',
        difficulties: [DIFFICULTIES.MYTHIC_RAID],
      },
      SW: {
        name: 'Wave: Silithid Warriors',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Adds,
          query: '(source.id = 134503 AND timestamp = source.firstSeen) OR (target.id = 134503 AND timestamp = target.firstSeen) OR (target.id = 134503 AND type = "death")',
          addCount: 6,
          guid: 134503,
        },
      },
      NW_M: {
        name: 'Wave: Nerubian Voidweavers',
        difficulties: [DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Adds,
          query: '(source.id = 135824 AND timestamp IN(source.firstSeen, source.lastSeen)) OR (target.id = 135824 AND timestamp IN(target.firstSeen, target.lastSeen))',
          addCount: 3,
          guid: 135824,
        },
      },
      P2: {
        name: 'Stage Two: Deception',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID],
        filter: {
          type: EventType.Cast,
          ability: {
            id: ENCOUNTER_EVENT.id,
          },
          eventInstance: 0,
        },
      },
      NW: {
        name: 'Wave: Nerubian Voidweavers',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID],
        filter: {
          type: EventType.Adds,
          query: '(source.id = 135824 AND timestamp IN(source.firstSeen, source.lastSeen)) OR (target.id = 135824 AND timestamp IN(target.firstSeen, target.lastSeen))',
          addCount: 3,
          guid: 135824,
        },
      },
      P2_M: {
        name: 'Stage Two: Corruption',
        difficulties: [DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Cast,
          ability: {
            id: ENCOUNTER_EVENT.id,
          },
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage Three: Corruption',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID],
        filter: {
          type: EventType.Cast,
          ability: {
            id: ENCOUNTER_EVENT.id,
          },
          eventInstance: 1,
        },
      },
    },
  },
};
