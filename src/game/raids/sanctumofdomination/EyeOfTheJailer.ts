import SPELLS from 'common/SPELLS';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/EyeOfTheJailer.jpg';
import Headshot from './images/headshots/EyeOfTheJailer.jpg';

const EyeOfTheJailer: Boss = {
  id: 2433,
  name: 'Eye of the Jailer',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_theeyeofthejailer',
  fight: {
    vantusRuneBuffId: 354385,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: true,
        name: 'Phase 1: His Gaze Upon You',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.STYGIAN_DARKSHIELD.id,
          },
        },
      },
      P2: {
        key: 'P2',
        multiple: true,
        name: 'Phase 2: Double Vision',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.STYGIAN_DARKSHIELD.id,
          },
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: Immediate Extermination',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.IMMEDIATE_EXTERMINATION.id,
          },
        },
      },
    },
  },
};

export default EyeOfTheJailer;
