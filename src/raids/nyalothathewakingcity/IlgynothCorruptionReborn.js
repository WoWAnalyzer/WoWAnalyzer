import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/IlgynothCorruptionReborn.jpg';
import Headshot from './images/headshots/IlgynothCorruptionReborn.png';

export default {
  id: 2345,
  name: 'Il\'gynoth, Corruption Reborn',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_ilgynoth',
  fight: {
    vantusRuneBuffId: 313551,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: The Corruptor, Reborn',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.ILGYNOTHS_MORASS.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: The Organs of Corruption',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'adds',
          guid: 158328,
          health: 0.1,
        },
      },
    },
  },
};
