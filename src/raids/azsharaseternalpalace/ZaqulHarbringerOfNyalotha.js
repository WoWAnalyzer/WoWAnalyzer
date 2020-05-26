import DIFFICULTIES from 'game/DIFFICULTIES';
import { EventType } from 'parser/core/Events';

import Background from './images/backgrounds/ZaqulHarbringerOfNyalotha.jpg';
import Headshot from './images/headshots/ZaqulHarbringerOfNyalotha.png';

export default {
  id: 2293,
  name: 'Za\'qul, Harbringer of Ny\'alotha',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_heraldofnzoth',
  fight: {
    vantusRuneBuffId: 285537,
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: {
      P1: {
        name: 'Stage 1: The Harbringer',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
      },
      P2: {
        name: 'Stage 2: Grip of Fear',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 150859,
          health: 85,
          eventInstance: 0,
        },
      },
      P3: {
        name: 'Stage 3: Delirium\'s Descent',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 150859,
          health: 70,
          eventInstance: 0,
        },
      },
      P4: {
        name: 'Stage 4: All Pathways Open',
        difficulties: [DIFFICULTIES.NORMAL_RAID, DIFFICULTIES.HEROIC_RAID, DIFFICULTIES.MYTHIC_RAID],
        filter: {
          type: EventType.Health,
          guid: 150859,
          health: 50,
          eventInstance: 0,
        },
      },
    },
  },
};
