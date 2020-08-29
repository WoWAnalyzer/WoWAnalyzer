import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/Maut.jpg';
import Headshot from './images/headshots/Maut.png';

export default {
  id: 2327,
  name: 'Maut',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_maut',
  fight: {
    vantusRuneBuffId: 306480,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P: {
        name: 'Stage 1: Obsidian Destroyer',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.OBSIDIAN_SKIN_MECHANIC.id,
          },
        },
        multiple: true,
      },
      I: {
        name: 'Stage 2: Obsidian Statue',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.OBSIDIAN_SKIN_MECHANIC.id,
          },
        },
        multiple: true,
      },
    },
  },
};
