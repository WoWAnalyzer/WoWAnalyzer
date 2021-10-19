import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/TheTarragrue.jpg';
import Headshot from './images/headshots/TheTarragrue.jpg';

const TheTarragrue: Boss = {
  id: 2423,
  name: 'The Tarrague',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_tarragrue',
  fight: {
    vantusRuneBuffId: 354384,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: Confronting the Terror',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: The Desperate Hour',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 175611,
          health: 10.0,
        },
      },
    },
  },
};

export default TheTarragrue;
