import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';

import Background from './images/backgrounds/ShadharTheInsatiable.jpg';
import Headshot from './images/headshots/ShadharTheInsatiable.png';

export default {
  id: 2335,
  name: 'Shad\'har the Insatiable',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_shadhar',
  fight: {
    vantusRuneBuffId: 306484,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Shadowy Carapace',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      P2: {
        name: 'Stage 2: Void-Tinged Carapace',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 157231,
          health: 66,
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Noxious Carapace',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 157231,
          health: 33,
          eventInstance: 0,
        },
      },
    },
  },
};
