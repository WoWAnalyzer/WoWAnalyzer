import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/TheProphetSkitra.jpg';
import Headshot from './images/headshots/TheProphetSkitra.png';

export default {
  id: 2334,
  name: 'The Prophet Skitra',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_skitra',
  fight: {
    vantusRuneBuffId: 306476,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    resultsWarning: 'Logs recorded for this fight contain many issues that may make analysis inaccurate. Please consider analyzing a different fight.',
    phases: {
      P1: {
        name: 'Stage 1: The Prophet',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.ILLUSIONARY_PROJECTION.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Illusionary Projections',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.ILLUSIONARY_PROJECTION.id,
          },
        },
      },
    },
  },
};
