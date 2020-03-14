import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';

import Background from './images/backgrounds/NzothTheCorruptor.jpg';
import Headshot from './images/headshots/NzothTheCorruptor.png';

export default {
  id: 2344,
  name: 'N\'Zoth, the Corruptor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_nzoth',
  fight: {
    vantusRuneBuffId: 313556,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Dominant Mind',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
      },
      P2: {
        name: 'Stage 2: Writhing Onslaught',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 158376,
          health: 0.1,
          eventInstance: 0,
        },
      },
    },
  },
};
