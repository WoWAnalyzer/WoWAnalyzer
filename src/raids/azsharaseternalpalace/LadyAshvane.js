import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/LadyAshvane.jpg';
import Headshot from './images/headshots/LadyAshvane.png';

export default {
  id: 2304,
  name: 'Lady Ashvane',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_ashvanemonstrosity',
  fight: {
    vantusRuneBuffId: 298643,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Hardened Carapace',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Exposed Azerite',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
        },
      },
    },
  },
};
