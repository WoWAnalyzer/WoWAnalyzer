import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/Backgrounds/Taloc.jpg';
import Headshot from './images/Headshots/Taloc.png';

export default {
  id: 2144,
  name: 'Taloc',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_talocthecorrupted',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [
        271811, // Cudgel of Gore
      ],
    },
    phases: [
      {
        id: '1',
        name: 'Stage One: The Corrupted Construct',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
      },
      {
        id: '2',
        name: 'Stage Two: Ruin\'s Descent',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.TALOC_POWERED_DOWN.id,
          },
        },
      },
      {
        id: '3',
        name: 'Stage Three: The Bottom Floor',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.TALOC_POWERED_DOWN.id,
          },
        },
      },
    ],
  },
};
