import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Trinkets from './trinkets';
import Embellishments from './embellishments';

const spells = safeMerge(Enchants, Trinkets, Embellishments);

export default spells;
