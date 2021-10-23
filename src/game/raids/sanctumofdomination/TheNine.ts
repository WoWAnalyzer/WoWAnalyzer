import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/TheNine.jpg';
import Headshot from './images/headshots/TheNine.jpg';

const TheNine: Boss = {
  id: 2429,
  name: 'The Nine',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_thenine',
  fight: {
    vantusRuneBuffId: 354386,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        name: 'Phase 1: The Unending Voice',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
      },
      P2: {
        key: 'P2',
        name: 'Phase 2: The First of the Mawsworn',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 177095,
          health: 10.0,
        },
      },
    },
  },
};

export default TheNine;
