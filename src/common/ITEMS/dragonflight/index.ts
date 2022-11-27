import safeMerge from 'common/safeMerge';

import Enchants from './enchants';
import Potions from './potions';

const items = safeMerge(Enchants, Potions);

export default items;
export * from './tier';
