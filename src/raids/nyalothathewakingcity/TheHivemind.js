import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/TheHivemind.jpg';
import Headshot from './images/headshots/TheHivemind.png';

export default {
  id: 2333,
  name: 'The Hivemind',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nzothraid_hivemind',
  fight: {
    vantusRuneBuffId: 306478,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Tek\'ris Controlled',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.TEKRIS_HIVEMIND_CONTROL.id,
          },
        },
      },
      P2: {
        name: 'Ka\'zir Controlled',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: SPELLS.KAZIR_HIVEMIND_CONTROL.id,
          },
        },
      },
    },
  },
};
