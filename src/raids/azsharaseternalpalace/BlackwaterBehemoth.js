import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/BlackwaterBehemoth.jpg';
import Headshot from './images/headshots/BlackwaterBehemoth.png';

export default {
  id: 2289,
  name: 'Blackwater Behemoth',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_wolfeel',
  fight: {
    vantusRuneBuffId: 298642,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P: {
        name: 'Platform',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Interrupt,
          ability: {
            id: SPELLS.CAVITATION_BEGIN_CAST.id,
          },
        },
        multiple: true,
      },
      I: {
        name: 'Intermission',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.BeginCast,
          ability: {
            id: SPELLS.CAVITATION_BEGIN_CAST.id,
          },
        },
        multiple: true,
      },
    },
  },
};
