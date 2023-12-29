import NorthrendBeasts from './NorthrendBeasts';
import LordJaraxxus from './LordJaraxxus';
import FactionChampions from './FactionChampions';
import ValkyrTwins from './ValkyrTwins';
import Anubarak from './Anubarak';
import type { Raid } from 'game/raids';

export default {
  name: 'Trial of the Grand Crusader', // T9
  bosses: {
    NorthrendBeasts,
    LordJaraxxus,
    FactionChampions,
    ValkyrTwins,
    Anubarak,
  },
} satisfies Raid;
