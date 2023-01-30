import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Enchants from './enchants';
import Gems from './gems';
import Others from './others';
import Phials from './phials';
import Potions from './potions';

const items = safeMerge(Crafted, Enchants, Gems, Others, Potions, Phials);

export default items;
export * from './tier';
