import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/Backgrounds/Vectis.jpg';
import Headshot from './images/Headshots/Vectis.png';

export default {
  id: 2134,
  name: 'Vectis',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_bloodofghuun',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage One: Probing Its Hosts',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.VECTIS_LIQUEFY.id,
          },
        },
      },
      P2: {
        name: 'Stage Two: Spreading Pandemic',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.VECTIS_LIQUEFY.id,
          },
        },
      },
    },
  },
};
