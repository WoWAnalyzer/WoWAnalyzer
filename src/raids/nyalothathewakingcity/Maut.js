import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
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
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
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
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
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
