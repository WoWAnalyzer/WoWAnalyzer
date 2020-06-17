import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/NzothTheCorruptor.jpg';
import Headshot from './images/headshots/NzothTheCorruptor.png';

export default {
  id: 2344,
  name: 'N\'Zoth, the Corruptor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_nzoth',
  fight: {
    vantusRuneBuffId: 313556,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    resultsWarning: 'Logs recorded for this fight contain many issues that may make analysis inaccurate, unless you were the one logging the fight. If not, please consider analyzing a different fight.',
    phases: {
      P1: {
        name: 'Stage 1: Dominant Mind',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID],
      },
      P2: {
        name: 'Stage 2: Writhing Onslaught',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 158376,
          health: 0.1,
          eventInstance: 0,
        },
      },
    },
  },
};
