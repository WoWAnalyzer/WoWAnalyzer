import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/Orgozoa.jpg';
import Headshot from './images/headshots/Orgozoa.png';

export default {
  id: 2303,
  name: 'Orgozoa',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_orgozoa',
  fight: {
    vantusRuneBuffId: 298644,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Egg Chamber',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      I1: {
        name: 'Intermission: The Moulting Hatchery',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'health',
          guid: 152128,
          health: 40,
          eventInstance: 0,
        },
      },
      P2: {
        name: 'Stage 2: Naga Chamber',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.MASSIVE_INCUBATOR_BUFF.id,
          },
          eventInstance: 0,
        },
      },
    },
  },
};
