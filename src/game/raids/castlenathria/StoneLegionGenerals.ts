import SPELLS from 'common/SPELLS';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';
import { Boss } from "game/raids";

import Background from './images/backgrounds/StoneLegionGenerals.jpg';
import Headshot from './images/headshots/StoneLegionGenerals.jpg';

const StoneLegionGenerals: Boss = {
  id: 2417,
  name: 'Stone Legion Generals',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_generalkaalgrashaal',
  fight: {
    vantusRuneBuffId: 311452,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Kaal\'s Assault',
        key: "P1",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Grashaal\'s Blitz',
        key: "P2",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.HARDENED_STONE_FORM_KAAL.id
          },
        },
      },
      P3: {
        name: 'Stage 3: Unified Offensive',
        key: "P3",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.HARDENED_STONE_FORM_GRASHAAL.id,
          },
        },
      },
      I: {
        name: 'Intermission',
        key: "I",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        multiple: true,
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.ANIMA_ENGORGED.id,
          },
        },
      },
    },
  },
};

export default StoneLegionGenerals;
