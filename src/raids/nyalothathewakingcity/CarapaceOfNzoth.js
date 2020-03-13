import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';

import Background from './images/backgrounds/CarapaceOfNzoth.jpg';
import Headshot from './images/headshots/CarapaceOfNzoth.png';

export default {
  id: 2337,
  name: 'Carapace of N\'Zoth',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_carapace',
  fight: {
    vantusRuneBuffId: 313554,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Exterior Carapace',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      P2: {
        name: 'Stage 2: Subcutaneous Tunnel',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 157439,
          health: 50,
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Locus of Infinite Truth',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 157439,
          health: 40,
          eventInstance: 0,
        },
      },
    },
  },
};
