import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';
import SPELLS from 'common/SPELLS';

import Background from './images/backgrounds/RadianceOfAzshara.jpg';
import Headshot from './images/headshots/RadianceOfAzshara.png';

export default {
  id: 2305,
  name: 'Radiance of Azshara',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_wrathofazshara',
  fight: {
    vantusRuneBuffId: 298631,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Rising Fury',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'removebuff',
          ability: {
            id: SPELLS.RADIANCE_OF_AZSHARA_ANCIENT_TEMPEST.id,
          },
        },
      },
      P2: {
        name: 'Stage 2: Raging Storm',
        multiple: true,
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC, FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'applybuff',
          ability: {
            id: SPELLS.RADIANCE_OF_AZSHARA_ANCIENT_TEMPEST.id,
          },
        },
      },
    },
  },
};
