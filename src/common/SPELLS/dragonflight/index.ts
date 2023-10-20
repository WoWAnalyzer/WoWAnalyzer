import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Enchants from './enchants';
import Food from './food';
import Others from './others';
import Phials from './phials';
import Potions from './potions';
import Trinkets from './trinkets';

const spells = safeMerge(Crafted, Enchants, Food, Others, Phials, Potions, Trinkets);

export default spells;
