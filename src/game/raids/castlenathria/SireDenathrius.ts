import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import { Boss } from "game/raids";

import Background from './images/backgrounds/SireDenathrius.jpg';
import Headshot from './images/headshots/SireDenathrius.jpg';

const SireDenathrius: Boss = {
  id: 2407,
  name: 'Sire Denathrius',
  background: Background,
  backgroundPosition: 'center top',
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_siredenathrius',
  fight: {
    vantusRuneBuffId: 334131,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: "P1",
        name: 'Stage 1: Sinners Be Cleansed',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      I: {
        key: "I",
        name: 'Intermission: March of the Penitent',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 167406,
          health: 70.0,
          eventInstance: 0,
        },
      },
      P2: {
        key: "P2",
        name: 'Stage 2: The Crimson Chorus',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.BEGIN_THE_CHORUS.id,
          },
          eventInstance: 0,
        }
      },
      P3: {
        key: "P3",
        name: 'Stage 3: Indignation',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.INDIGNATION.id,
          },
          eventInstance: 0,
        }
      },
    },
  },
};

export default SireDenathrius
