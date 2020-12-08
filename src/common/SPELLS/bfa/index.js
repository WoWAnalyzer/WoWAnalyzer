import safeMerge from 'common/safeMerge';

import Enchants from './enchants';
import Potions from './potions';
import Essences from './essences';

export default safeMerge(Enchants, Potions, Essences);
