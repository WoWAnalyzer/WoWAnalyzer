import safeMerge from 'common/safeMerge';

import Dungeons from './dungeons';
import Raids from './raids';
import Enchants from './enchants';
import Potions from './potions';
import Crafted from './crafted';
import PVP from './pvp';
import Essences from './essences';

export default safeMerge(Dungeons, Raids, Enchants, Potions, Crafted, PVP, Essences);
