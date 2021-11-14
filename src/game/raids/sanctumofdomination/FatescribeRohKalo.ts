import SPELLS from 'common/SPELLS';
import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/FatescribeRohKalo.jpg';
import Headshot from './images/headshots/FatescribeRohKalo.jpg';

const FatescribeRohKalo: Boss = {
  id: 2431,
  name: 'Fatescribe Roh-Kalo',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_fatescriberoh-talo',
  fight: {
    vantusRuneBuffId: 354391,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: true,
        name: 'Phase 1: Scrying Fate',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.RemoveBuff,
          ability: {
            id: SPELLS.REALIGN_FATE.id,
          },
        },
      },
      P2: {
        key: 'P2',
        multiple: true,
        name: 'Phase 2: Defying Destiny',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.REALIGN_FATE.id,
          },
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: Fated Terminus',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.ApplyBuff,
          ability: {
            id: SPELLS.EXTEMPEROUS_FATE.id,
          },
        },
      },
    },
  },
};

export default FatescribeRohKalo;
