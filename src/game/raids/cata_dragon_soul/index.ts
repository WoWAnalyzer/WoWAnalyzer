import { Raid } from 'game/raids';
import Morchok from './Morchok';
import Zonozz from './Zonozz';
import Yorsahj from './Yorsahj';
import Hagara from './Hagara';
import Ultraxion from './Ultraxion';
import Blackhorn from './Blackhorn';
import DeathwingSpine from './DeathwingSpine';
import DeathwingMadness from './DeathwingMadness';

export default {
  name: 'Dragon Soul',
  bosses: {
    Morchok,
    Zonozz,
    Yorsahj,
    Hagara,
    Ultraxion,
    Blackhorn,
    DeathwingSpine,
    DeathwingMadness,
  },
} satisfies Raid;
