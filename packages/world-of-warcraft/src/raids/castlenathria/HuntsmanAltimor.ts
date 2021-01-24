import { Boss } from "raids/index";
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/HuntsmanAltimor.jpg';
import Headshot from './images/headshots/HuntsmanAltimor.jpg';

const HuntsmanAltimor: Boss = {
  id: 2418,
  name: 'Huntsman Altimor',
  background: Background,
  backgroundPosition: 'center top',
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_altimor',
  fight: {
    vantusRuneBuffId: 334132,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Margore',
        multiple: false,
        key: "P1",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        key: "P2",
        name: 'Stage 2: Bargast',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 169457,
          health: 99.9,
          eventInstance: 0,
        },
      },
      P3: {
        key: "P3",
        name: 'Stage 3: Hecutis',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 169458,
          health: 99.9,
          eventInstance: 0,
        },
      },
    },
  },
};

export default HuntsmanAltimor