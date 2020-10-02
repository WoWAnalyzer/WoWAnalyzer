import DIFFICULTIES from 'game/DIFFICULTIES';

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

export default {
  id: 2407,
  name: 'Sire Denathrius',
  background: Background,
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
        name: 'Stage 1: Sinners Be Cleansed',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      I: {
        name: 'Intermission: March of the Penitent',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: The Crimson Chorus',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P3: {
        name: 'Stage 3: Indignation',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
    },
  },
};
