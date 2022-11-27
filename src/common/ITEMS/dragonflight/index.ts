import safeMerge from 'common/safeMerge';

import Enchants from './enchants';
import Potions from './potions';
import Gems from './gems';

const items = safeMerge(Enchants, Potions, Gems);

export default items;
export * from './tier';
