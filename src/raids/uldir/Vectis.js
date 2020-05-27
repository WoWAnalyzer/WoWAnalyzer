import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/Backgrounds/Vectis.jpg';
import Headshot from './images/Headshots/Vectis.png';

export default {
  id: 2134,
  name: 'Vectis',
  background: Background,
  backgroundPosition: 'center center',
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
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.VECTIS_LIQUEFY.id,
          },
        },
      },
      P2: {
        name: 'Stage Two: Spreading Pandemic',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.VECTIS_LIQUEFY.id,
          },
        },
      },
    },
  },
};
