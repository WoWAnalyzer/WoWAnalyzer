import SPELLS from 'common/SPELLS';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/PainsmithRaznal.jpg';
import Headshot from './images/headshots/PainsmithRaznal.jpg';

const PainsmithRaznal: Boss = {
  id: 2430,
  name: 'Painsmith Raznal',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_painsmithraznal',
  fight: {
    vantusRuneBuffId: 354404,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: Rippling Hammer',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
      },
      I: {
        key: 'I',
        multiple: true,
        name: 'Intermission: The Screaming Anvil',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.FORGES_FLAME.id,
          },
        },
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: Cruciform Axe',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 176523,
          health: 69.0,
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: Dualblade Scythe',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 176523,
          health: 39.0,
        },
      },
    },
  },
};

export default PainsmithRaznal;
