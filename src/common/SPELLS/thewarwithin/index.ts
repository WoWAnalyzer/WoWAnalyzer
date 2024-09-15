import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Embellishments from './embellishments';
import Others from './others';

const spells = safeMerge(Enchants, Embellishments, Others);

export default spells;
