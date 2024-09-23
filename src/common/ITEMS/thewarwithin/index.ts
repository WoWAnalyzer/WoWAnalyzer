import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Potions from './potions';
import Trinkets from './trinkets';
import Embellishments from './embellishments';

const spells = safeMerge(Enchants, Potions, Trinkets, Embellishments);

export default spells;
