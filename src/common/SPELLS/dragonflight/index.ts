import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Food from './food';
import Others from './others';
import Phials from './phials';
import Potions from './potions';

const spells = safeMerge(Crafted, Food, Others, Phials, Potions);

export default spells;
