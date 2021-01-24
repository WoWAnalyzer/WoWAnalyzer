import { Boss } from "raids/index";
import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/Shriekwing.jpg';
import Headshot from './images/headshots/Shriekwing.jpg';

const Shriekwing: Boss  = {
  id: 2398,
  name: 'Shriekwing',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_shriekwing',
  fight: {
    vantusRuneBuffId: 311445,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Thirst for Blood',
        multiple: true,
        key: "P1",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.BLOOD_SHROUD.id,
          },
        },
      },
      P2: {
        key: "P2",
        name: 'Stage 2: Terror of Castle Nathria',
        multiple: true,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.BLOOD_SHROUD.id,
          },
        },
      },
    },
  },
};

export default Shriekwing;