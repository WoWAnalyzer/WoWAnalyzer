import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/Vexiona.jpg';
import Headshot from './images/headshots/Vexiona.png';

export default {
  id: 2336,
  name: 'Vexiona',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_vexiona',
  fight: {
    vantusRuneBuffId: 306479,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Cult of the Void',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      P2: {
        name: 'Stage 2: Death From Above',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.POWER_OF_THE_CHOSEN.id,
          },
        },
      },
      P3: {
        name: 'Stage 3: The Void Unleashed',
        multiple: false,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 157354,
          health: 40,
          eventInstance: 0,
        },
      },
    },
  },
};
