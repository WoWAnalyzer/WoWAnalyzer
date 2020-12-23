import { Boss } from "raids/index";
import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/SunKingsSalvation.jpg';
import Headshot from './images/headshots/SunKingsSalvation.jpg';

const SunKingsSalvation: Boss = {
  id: 2402,
  name: 'Sun King\'s Salvation',
  background: Background,
  backgroundPosition: 'center top',
  headshot: Headshot,
  icon: 'achievement_raid_revendrethraid_kaelthassunstrider',
  fight: {
    resultsWarning: 'Because of the way this encounter was designed, some statistics and suggestions may be inaccurate. Therefore this encounter is not recommended for improving overall play. Instead you should use this encounter for improving on this encounter only.',
    vantusRuneBuffId: 311448,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: Ministers of Vice 1',
        multiple: false,
        key: "P1",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        key: "P2",
        name: 'Stage 2: Reflection of Guilt 1',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 165805,
          health: 55.0,
          eventInstance: 0,
        },
      },
      P1_2: {
        name: 'Stage 1: Ministers of Vice 2',
        multiple: false,
        key: "P1_2",
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 165805,
          health: 45.0,
          eventInstance: 0,
        },
      },
      P2_2: {
        key: "P2_2",
        name: 'Stage 2: Reflection of Guilt 2',
        multiple: false,
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 165805,
          health: 10.0,
          eventInstance: 0,
        },
      },
    },
  },
};

export default SunKingsSalvation;