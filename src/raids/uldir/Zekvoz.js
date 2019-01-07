import FIGHT_DIFFICULTIES from 'common/FIGHT_DIFFICULTIES';

import Background from './images/Backgrounds/Zekvoz.jpg';
import Headshot from './images/Headshots/Zekvoz.png';

export default {
  id: 2136,
  name: 'Zek\'voz',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_zekvoz',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [
        265237, // Shatter
      ],
      magical: [
        265264, // Void Lash
      ],
    },
    phases: [
      {
        id: '1',
        name: 'Stage One: Chaos',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
      },
      {
        id: '1',
        name: 'Stage One: Chaos and Deception',
        difficulties: [FIGHT_DIFFICULTIES.MYTHIC],
      },
      {
        id: '1A',
        name: 'Wave: Nerubian Voidweavers',
        difficulties: [FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'adds',
          query: '(source.id = 135824 AND timestamp IN(source.firstSeen, source.lastSeen)) OR (target.id = 135824 AND timestamp IN(target.firstSeen, target.lastSeen))',
          addCount: 3,
          guid: 135824,
        },
      },
      {
        id: '2',
        name: 'Stage Two: Deception',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
        filter: {
          type: 'cast',
          ability: {
            id: 181089,
          },
          eventInstance: 0,
        },
      },
      {
        id: '2A',
        name: 'Wave: Nerubian Voidweavers',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
        filter: {
          type: 'adds',
          query: '(source.id = 135824 AND timestamp IN(source.firstSeen, source.lastSeen)) OR (target.id = 135824 AND timestamp IN(target.firstSeen, target.lastSeen))',
          addCount: 3,
          guid: 135824,
        },
      },
      {
        id: '2',
        name: 'Stage Two: Corruption',
        difficulties: [FIGHT_DIFFICULTIES.MYTHIC],
        filter: {
          type: 'cast',
          ability: {
            id: 181089,
          },
          eventInstance: 0,
        },
      },
      {
        id: '3',
        name: 'Stage Three: Corruption',
        difficulties: [FIGHT_DIFFICULTIES.NORMAL, FIGHT_DIFFICULTIES.HEROIC],
        filter: {
          type: 'cast',
          ability: {
            id: 181089,
          },
          eventInstance: 1,
        },
      },
    ],
  },
};
