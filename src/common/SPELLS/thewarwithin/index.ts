import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Embellishments from './embellishments';
import Others from './others';
import Raids from './raids';

const spells = safeMerge(Enchants, Embellishments, Others, Raids);

export default spells;
