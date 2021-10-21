import DIFFICULTIES from 'game/DIFFICULTIES';
import { Boss } from 'game/raids';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/RemnantOfNerzhul.jpg';
import Headshot from './images/headshots/RemnantOfNerzhul.jpg';

const RemnantOfNerzhul: Boss = {
  id: 2432,
  name: "Remnant of Ner'zhul",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_torghast_shadowscourge_prisonofnerzhul',
  fight: {
    vantusRuneBuffId: 354387,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        key: 'P1',
        multiple: false,
        name: 'Phase 1: Spite',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
      },
      P2: {
        key: 'P2',
        multiple: false,
        name: 'Phase 2: Contempt',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 175729,
          health: 80.0,
        },
      },
      P3: {
        key: 'P3',
        multiple: false,
        name: 'Phase 3: Loathing',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 175729,
          health: 60.0,
        },
      },
      P4: {
        key: 'P4',
        multiple: false,
        name: 'Phase 4: Enmity',
        difficulties: [
          DIFFICULTIES.NORMAL_RAID,
          DIFFICULTIES.HEROIC_RAID,
          DIFFICULTIES.MYTHIC_RAID,
        ],
        filter: {
          type: EventType.Health,
          guid: 175729,
          health: 30.0,
        },
      },
    },
  },
};

export default RemnantOfNerzhul;
