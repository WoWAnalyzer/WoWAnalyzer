import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/LadyAshvane.jpg';
import Headshot from './images/headshots/LadyAshvane.png';

export default {
  id: 2304,
  name: 'Lady Ashvane',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_ashvanemonstrosity',
  fight: {
    vantusRuneBuffId: 298643,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1_1: {
        name: 'Stage 1: Hardened Carapace 1',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
          eventInstance: 0,
        },
      },
      P2_1: {
        name: 'Stage 2: Exposed Azerite 1',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
          eventInstance: 0,
        },
      },
      P1_2: {
        name: 'Stage 1: Hardened Carapace 2',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
          eventInstance: 1,
        },
      },
      P2_2: {
        name: 'Stage 2: Exposed Azerite 2',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
          eventInstance: 1,
        },
      },
      P1_3: {
        name: 'Stage 1: Hardened Carapace 3',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
          eventInstance: 2,
        },
      },
      P2_3: {
        name: 'Stage 2: Exposed Azerite 3',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.LADY_ASHVANE_HARDENED_CARAPACE.id,
          },
          eventInstance: 2,
        },
      },
    },
  },
};
