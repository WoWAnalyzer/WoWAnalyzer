import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/ZaqulHarbringerOfNyalotha.jpg';
import Headshot from './images/headshots/ZaqulHarbringerOfNyalotha.png';

export default {
  id: 2293,
  name: 'Za\'qul, Harbringer of Ny\'alotha',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_heraldofnzoth',
  fight: {
    vantusRuneBuffId: 285537,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: The Harbringer',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      P2: {
        name: 'Stage 2: Grip of Fear',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.OPENING_FEAR_REALM.id,
          },
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Delirium\'s Descent',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'begincast',
          ability: {
            id: SPELLS.DELIRIUMS_DESCENT.id,
          },
          eventInstance: 0,
        },
      },
      P4: {
        name: 'Stage 4: All Pathways Open',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.DARK_PASSAGE.id,
          },
          eventInstance: 0,
        },
      },
    },
  },
};
