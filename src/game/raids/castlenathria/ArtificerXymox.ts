import { Boss } from "game/raids";
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/ArtificerXymox.jpg';
import Headshot from './images/headshots/ArtificerXymox.jpg';

const ArtificerXymox: Boss = {
  id: 2405,
  name: 'Artificer Xy\'mox',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_artificerxymox',
  fight: {
    vantusRuneBuffId: 311447,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Crystal of Phantasms',
        multiple: false,
        key: "P1",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        key: "P2",
        name: 'Stage 2: Root of Extinction',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 166644,
          health: 70.0,
          eventInstance: 0,
        },
      },
      P3: {
        key: "P3",
        name: 'Stage 3: Edge of Annihilation',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 166644,
          health: 40.0,
          eventInstance: 0,
        },
      },
    },
  },
};

export default ArtificerXymox;
