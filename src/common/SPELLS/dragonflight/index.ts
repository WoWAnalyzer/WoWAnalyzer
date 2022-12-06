import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Others from './others';
import Potions from './potions';

const spells = safeMerge(Crafted, Others, Potions);

export default spells;
