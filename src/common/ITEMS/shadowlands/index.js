import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Dungeons from './dungeons';
import Enchants from './enchants';
import Gems from './gems';
import Legendaries from './legendaries';
import Potions from './potions';
import PVP from './pvp';
import Raids from './raids';

export default safeMerge(Crafted, Dungeons, Enchants, Gems, Legendaries, Potions, PVP, Raids);
