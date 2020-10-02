import DIFFICULTIES from 'game/DIFFICULTIES';

import Background from './images/backgrounds/CastleNathria.jpg';
import Headshot from './images/headshots/CastleNathriaHeadshot.png';

export default {
  id: 2417,
  name: 'Stone Legion Generals',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_generalkaalgrashaal',
  fight: {
    vantusRuneBuffId: 311452,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Kaal\'s Assault',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Grashaal\'s Blitz',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P3: {
        name: 'Stage 3: Unified Offensive',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
    },
  },
};
