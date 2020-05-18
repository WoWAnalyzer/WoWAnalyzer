import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/WrathionTheBlackEmperor.jpg';
import Headshot from './images/headshots/WrathionTheBlackEmperor.png';

export default {
  id: 2329,
  name: 'Wrathion, the Black Emperor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_wrathion',
  fight: {
    vantusRuneBuffId: 306475,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: The Black Emperor',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Cast,
          ability: {
            id: SPELLS.CREEPING_MADNESS.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Smoke and Mirrors',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Cast,
          ability: {
            id: SPELLS.SMOKE_AND_MIRRORS.id,
          },
        },
      },
    },
  },
};
