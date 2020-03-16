import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/WrathionTheBlackEmperor.jpg';
import Headshot from './images/headshots/WrathionTheBlackEmperor.png';

export default {
  id: 2329,
  name: 'Wrathion, the Black Emperor',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_wrathion',
  fight: {
    vantusRuneBuffId: 306475,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: The Black Emperor',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.CREEPING_MADNESS.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Smoke and Mirrors',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.SMOKE_AND_MIRRORS.id,
          },
        },
      },
    },
  },
};
