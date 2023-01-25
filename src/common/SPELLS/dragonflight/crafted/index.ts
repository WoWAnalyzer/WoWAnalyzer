import safeMerge from 'common/safeMerge';

import Alchemy from './alchemy';
import Leatherworking from './leatherworking';

const spells = safeMerge(Alchemy, Leatherworking);

export default spells;
