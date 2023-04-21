import { Boss } from 'game/raids';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic/raids';

import Headshot from './images/YoggHeadshot.jpg';
import Background from './images/Yogg.jpg';

const YoggSaron: Boss = {
  id: 756,
  name: 'Yogg-Saron',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_yoggsaron_01',
  fight: {
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: The Lucid Dream',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: Descent Into Madness',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.SHADOWY_BARRIER_YOGG.id,
          },
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: True Face of Death',
        difficulties: [DIFFICULTIES.NORMAL_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.SHADOWY_BARRIER_YOGG.id,
          },
        },
      },
    },
  },
};

export default YoggSaron;
