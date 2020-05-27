import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

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
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.MYTHRAX_OBLIVION_VEIL.id,
          },
        },
      },
      P2: {
        name: 'Stage Two: Ancient Awakening',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.MYTHRAX_OBLIVION_VEIL.id,
          },
        },
      },
    },
  },
};
