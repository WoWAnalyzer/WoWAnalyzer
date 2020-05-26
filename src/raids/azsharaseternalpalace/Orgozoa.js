import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/Orgozoa.jpg';
import Headshot from './images/headshots/Orgozoa.png';

export default {
  id: 2303,
  name: 'Orgozoa',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_orgozoa',
  fight: {
    vantusRuneBuffId: 298644,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Egg Chamber',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      I1: {
        name: 'Intermission: The Moulting Hatchery',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 152128,
          health: 40,
          eventInstance: 0,
        },
      },
      P2: {
        name: 'Stage 2: Naga Chamber',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.MASSIVE_INCUBATOR_BUFF.id,
          },
          eventInstance: 0,
        },
      },
    },
  },
};
