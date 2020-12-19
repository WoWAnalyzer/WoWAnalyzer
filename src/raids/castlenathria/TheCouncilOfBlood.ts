import { Boss } from "raids/index";
import DIFFICULTIES from 'game/DIFFICULTIES';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/TheCouncilOfBlood.jpg';
import Headshot from './images/headshots/TheCouncilOfBlood.jpg';

const TheCouncilOfBlood: Boss = {
  id: 2412,
  name: 'The Council of Blood',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_nobilitycouncil',
  fight: {
    vantusRuneBuffId: 311450,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P: {
        key: "P",
        name: 'Stage 1: The Council of Blood',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        multiple: true,
        filter: {
          type: EventType.ApplyDebuff,
          ability: {
            id: SPELLS.OPPRESSIVE_ATMOSPHERE.id,
          },
        }
      },
      I: {
        key: "I",
        name: 'Intermission: The Danse Macabre',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        multiple: true,
        filter: {
          type: EventType.Cast,
          ability: {
            id: SPELLS.DANCE_AREA_TRIGGER.id,
          },
        }
      },
    },
  },
};

export default TheCouncilOfBlood;