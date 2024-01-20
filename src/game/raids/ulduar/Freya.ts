import type { Boss } from 'game/raids';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic/raids';

import Headshot from './images/FreyaHeadshot.jpg';
import Background from './images/Freya.jpg';

const Freya: Boss = {
  id: 753,
  name: 'Freya',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_freya_01',
  fight: {
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: Allies of Nature',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: Freya',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.ATTUNED_TO_NATURE.id,
          },
        },
      },
    },
  },
};

export default Freya;
