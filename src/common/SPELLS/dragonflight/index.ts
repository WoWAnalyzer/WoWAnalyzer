import safeMerge from 'common/safeMerge';

import Others from './others';
import Potions from './potions';

const spells = safeMerge(Others, Potions);

export default spells;
