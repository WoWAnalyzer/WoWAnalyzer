import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Embellishments from './embellishments';
import Food from './food';
import Others from './others';
import Potions from './potions';
import Raids from './raids';
import Trinkets from './trinkets';

const spells = safeMerge(Enchants, Embellishments, Food, Others, Potions, Raids, Trinkets);

export default spells;
