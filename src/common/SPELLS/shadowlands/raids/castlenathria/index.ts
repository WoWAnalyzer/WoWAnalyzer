import safeMerge from 'common/safeMerge';

import ITEMS from './items';
import MECHANICS from './mechanics';

const spells = safeMerge<typeof ITEMS & typeof MECHANICS>(ITEMS, MECHANICS);
export default spells; 