import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

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
      I1: {
        name: 'Intermission 2',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: EventType.BeginCast,
          ability: {
            id: SPELLS.QUEENS_DECREE.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Hearts Unleashed',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: EventType.Health,
          guid: 152910,
          health: 99.9,
          eventInstance: 0,
        },
      },
      I2: {
        name: 'Intermission 2',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: EventType.Health,
          guid: 152910,
          health: 70,
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Song of the Tides',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: EventType.Health,
          guid: 154565,
          health: 99.9,
          eventInstance: 0,
        },
      },
      P4: {
        name: 'Stage 4: My Palace Is a Prison',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: EventType.Health,
          guid: 152910,
          health: 45,
          eventInstance: 0,
        },
      },
    },
  },
};
