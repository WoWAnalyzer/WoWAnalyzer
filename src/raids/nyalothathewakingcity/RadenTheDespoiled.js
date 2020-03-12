import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';

import Background from './images/backgrounds/RadenTheDespoiled.jpg';
import Headshot from './images/headshots/RadenTheDespoiled.png';

export default {
  id: 2331,
  name: 'Ra-den the Despoiled',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_raden',
  fight: {
    vantusRuneBuffId: 313550,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Gathering Power',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      P2: {
        name: 'Stage 2: Unleashed Wrath',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 156866,
          health: 40,
          eventInstance: 0,
        },
      },
    },
  },
};
