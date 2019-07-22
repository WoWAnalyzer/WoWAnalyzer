import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/QueenAzshara.jpg';
import Headshot from './images/headshots/QueenAzshara.png';

export default {
  id: 2299,
  name: 'Queen Azshara',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_azshara',
  fight: {
    vantusRuneBuffId: 302914,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Cursed Lovers',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      P2: {
        name: 'Stage 2: Hearts Unleashed',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.WARD_OF_POWER_BUFF.id,
          },
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Song of the Tides',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'begincast',
          ability: {
            id: SPELLS.DRAIN_ANCIENT_WARD.id,
          },
        },
      },
      P4: {
        name: 'Stage 4: My Palace Is a Prison',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.AZSHARA_VOID_TOUCHED.id,
          },
          eventInstance: 0,
        },
      },
    },
  },
};
