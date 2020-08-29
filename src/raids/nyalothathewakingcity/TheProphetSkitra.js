import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/TheProphetSkitra.jpg';
import Headshot from './images/headshots/TheProphetSkitra.png';

export default {
  id: 2334,
  name: 'The Prophet Skitra',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_skitra',
  fight: {
    vantusRuneBuffId: 306476,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    resultsWarning: 'Logs recorded for this fight contain many issues that may make analysis inaccurate, unless you were the one logging the fight. If not, please consider analyzing a different fight.',
    phases: {
      P1: {
        name: 'Stage 1: The Prophet',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.ILLUSIONARY_PROJECTION.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Illusionary Projections',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.ILLUSIONARY_PROJECTION.id,
          },
        },
      },
    },
  },
};
