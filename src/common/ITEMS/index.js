import indexById from '../indexById';
import safeMerge from '../safeMerge';

import OTHERS from './OTHERS';
import BFA from './BFA';

import DEATH_KNIGHT from './DEATH_KNIGHT';
import DEMON_HUNTER from './DEMON_HUNTER';
import DRUID from './DRUID';
import HUNTER from './HUNTER';
import MAGE from './MAGE';
import MONK from './MONK';
import PALADIN from './PALADIN';
import PRIEST from './PRIEST';
import ROGUE from './ROGUE';
import SHAMAN from './SHAMAN';
import WARLOCK from './WARLOCK';
import WARRIOR from './WARRIOR';

export default indexById(
  safeMerge(
    OTHERS,
    BFA,
    DEATH_KNIGHT,
    DEMON_HUNTER,
    DRUID,
    HUNTER,
    MAGE,
    MONK,
    PALADIN,
    PRIEST,
    ROGUE,
    SHAMAN,
    WARLOCK,
    WARRIOR
  )
);
