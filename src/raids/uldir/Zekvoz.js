import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';

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
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
      },
      P1_M: {
        name: 'Stage One: Chaos and Deception',
        difficulties: [FIGHT_DIFFICULTIES.MYTHIC],
      },
      SW: {
        name: 'Wave: Silithid Warriors',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'adds',
          query: '(source.id = 134503 AND timestamp = source.firstSeen) OR (target.id = 134503 AND timestamp = target.firstSeen) OR (target.id = 134503 AND type = "death")',
          addCount: 6,
          guid: 134503,
        },
      },
      NW_M: {
        name: 'Wave: Nerubian Voidweavers',
        difficulties: [FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'adds',
          query: '(source.id = 135824 AND timestamp IN(source.firstSeen, source.lastSeen)) OR (target.id = 135824 AND timestamp IN(target.firstSeen, target.lastSeen))',
          addCount: 3,
          guid: 135824,
        },
      },
      P2: {
        name: 'Stage Two: Deception',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
        filter: {
          type: 'cast',
          ability: {
            id: ENCOUNTER_EVENT.id,
          },
          eventInstance: 0,
        },
      },
      NW: {
        name: 'Wave: Nerubian Voidweavers',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
        filter: {
          type: 'adds',
          query: '(source.id = 135824 AND timestamp IN(source.firstSeen, source.lastSeen)) OR (target.id = 135824 AND timestamp IN(target.firstSeen, target.lastSeen))',
          addCount: 3,
          guid: 135824,
        },
      },
      P2_M: {
        name: 'Stage Two: Corruption',
        difficulties: [FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: ENCOUNTER_EVENT.id,
          },
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage Three: Corruption',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
        filter: {
          type: 'cast',
          ability: {
            id: ENCOUNTER_EVENT.id,
          },
          eventInstance: 1,
        },
      },
    },
  },
};
