import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/Backgrounds/Mythrax.jpg';
import Headshot from './images/Headshots/Mythrax.png';

export default {
  id: 2135,
  name: 'Mythrax the Unraveler',
  background: Background,
  backgroundPosition: 'center center',
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_mythraxtheunraveler',
  fight: {
    // vantusRuneBuffId: ,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [
        273282, // Essence Shear
      ],
    },
    phases: {
      P1: {
        name: 'Stage One: Oblivion\'s Call',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.MYTHRAX_OBLIVION_VEIL.id,
          },
        },
      },
      P2: {
        name: 'Stage Two: Ancient Awakening',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.MYTHRAX_OBLIVION_VEIL.id,
          },
        },
      },
    },
  },
};
