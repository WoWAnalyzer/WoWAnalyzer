import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/Backgrounds/Ghuun.jpg';
import Headshot from './images/Headshots/Ghuun.png';
import './Ghuun.css';

export const GHUUN_REORIGINATION_BLAST_STUN = {
  id: 263504,
  name: "Reorigination Blast",
  icon: "ability_druid_cresentburn",
};

export default {
  id: 2122,
  name: 'G\'huun',
  background: Background,
  backgroundPosition: 'center center',
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_ghuun',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [
        267412, //Massive Smash
      ],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage One: My Minions Are Endless!',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage Two: Behold the Power of Ghuun!',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.RemoveDebuff,
          ability: {
            id: GHUUN_REORIGINATION_BLAST_STUN.id,
          },
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage Three: Your Destruction is Assured!',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.GHUUN_COLLAPSE_2.id,
          },
        },
      },
    },
  },
};
