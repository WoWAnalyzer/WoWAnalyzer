import { Boss } from "raids/index";
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/LadyInervaDarkvein.jpg';
import Headshot from './images/headshots/LadyInervaDarkvein.jpg';

const LadyInervaDarkvein: Boss = {
  id: 2406,
  name: 'Lady Inerva Darkvein',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_ladyinervadarkvein',
  fight: {
    vantusRuneBuffId: 311449,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Container of Desire',
        multiple: false,
        key: "P1",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        key: "P2",
        name: 'Stage 2: Container of Bottled Anima',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 165521,
          health: 75.0,
          eventInstance: 0,
        },
      },
      P3: {
        key: "P3",
        name: 'Stage 3: Container of Sin',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 165521,
          health: 50.0,
          eventInstance: 0,
        },
      },
      P4: {
        key: "P3",
        name: 'Stage 3: Container of Concentrated Anima',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 165521,
          health: 25.0,
          eventInstance: 0,
        },
      },
    },
  },
};

export default LadyInervaDarkvein