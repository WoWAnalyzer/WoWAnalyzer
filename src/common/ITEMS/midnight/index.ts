import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Potions from './potions';
import Trinkets from './trinkets';
import Embellishments from './embellishments';
import Gems from './gems';
import others from './others';
import Engineering from './engineering';

const items = safeMerge(Enchants, Gems, Potions, Trinkets, Embellishments, others, Engineering);

export default items;
