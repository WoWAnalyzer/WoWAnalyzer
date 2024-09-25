import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Potions from './potions';
import Trinkets from './trinkets';
import Embellishments from './embellishments';
import Gems from 'common/ITEMS/thewarwithin/gems';

const items = safeMerge(Enchants, Gems, Potions, Trinkets, Embellishments);

export default items;
