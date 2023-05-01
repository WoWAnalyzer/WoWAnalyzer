import { Boss } from 'game/raids';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic/raids';

import Headshot from './images/MimironHeadshot.jpg';
import Background from './images/Mimiron.jpg';

const Mimiron: Boss = {
  id: 754,
  name: 'Mimiron',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_mimiron_01',
  fight: {
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: Leviathan MK II',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: VX-001',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.Health,
          guid: 33651, // VX-001
          health: 100,
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: Aerial Command Unit',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.Health,
          guid: 33670, // Aerial Command Unit
          health: 100,
        },
      },
      P4: {
        key: 'P4',
        multiple: false,
        name: 'Phase 4: V-07-TR-0N',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.BeginCast,
          ability: {
            id: SPELLS.PLASMA_BALL.id,
          },
        },
      },
    },
  },
};

export default Mimiron;
