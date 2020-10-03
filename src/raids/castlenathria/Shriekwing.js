import DIFFICULTIES from 'game/DIFFICULTIES';

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

export default {
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
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Terror of Castle Nathria',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
    },
  },
};
