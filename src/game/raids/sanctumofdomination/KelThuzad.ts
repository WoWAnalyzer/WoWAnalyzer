import SPELLS from 'common/SPELLS';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/KelThuzad.jpg';
import Headshot from './images/headshots/KelThuzad.jpg';

const KelThuzad: Boss = {
  id: 2422,
  name: "Kel'Thuzad",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_kel-thuzad',
  fight: {
    vantusRuneBuffId: 354392,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: true,
        name: 'Phase 1: Chains and Ice',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.UNDYING_WRATH.id,
          },
        },
      },
      P2: {
        key: 'P2',
        multiple: true,
        name: 'Phase 2: The Phylactery Opens',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 176929,
          health: 99.9,
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: The Final Stand',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 176929,
          health: 0.1,
        },
      },
    },
  },
};

export default KelThuzad;
