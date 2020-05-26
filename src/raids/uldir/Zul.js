import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/Backgrounds/Zul.jpg';
import Headshot from './images/Headshots/Zul.png';

export default {
  id: 2145,
  name: 'Zul',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_zul',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage One: The Forces of Blood',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage Two: Zul, Awakened',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.BeginCast,
          ability: {
            id: 274168,
          },
        },
      },
    },
  },
};
