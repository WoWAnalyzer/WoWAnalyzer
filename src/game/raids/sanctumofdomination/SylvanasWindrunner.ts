import SPELLS from 'common/SPELLS';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/SylvanasWindrunner.jpg';
import Headshot from './images/headshots/SylvanasWindrunner.jpg';

const SylvanasWindrunner: Boss = {
  id: 2435,
  name: 'Sylvanas Windrunner',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_sylvanaswindrunner',
  fight: {
    vantusRuneBuffId: 354393,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: A Cycle of Hatred',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
      },
      I: {
        key: 'I',
        multiple: false,
        name: 'Intermission: A Monument to Our Suffering',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 175732,
          health: 83.9,
        },
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: The Banshee Queen',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.BeginCast,
          ability: {
            id: SPELLS.BANSHEE_WAIL.id,
          },
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: The Freedom of Choice',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 175732,
          health: 74.5,
        },
      },
    },
  },
};

export default SylvanasWindrunner;
