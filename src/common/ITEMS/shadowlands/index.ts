import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Enchants from './enchants';
import Gems from './gems';
import Legendaries from './legendaries';
import Others from './others';
import Potions from './potions';
import PVP from './pvp';

const items = safeMerge(Crafted, Enchants, Gems, Legendaries, Potions, Others, PVP);

export default items;
export * from './tier';
