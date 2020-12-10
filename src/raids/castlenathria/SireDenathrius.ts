import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from "raids/index";

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
      },
      P2: {
        key: "P2",
        name: 'Stage 2: The Crimson Chorus',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P3: {
        key: "P3",
        name: 'Stage 3: Indignation',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
    },
  },
};

export default SireDenathrius