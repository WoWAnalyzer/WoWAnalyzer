import safeMerge from 'common/safeMerge';

import Alchemy from './alchemy';
import Inscription from './inscription';
import Leatherworking from './leatherworking';

const items = safeMerge(Alchemy, Inscription, Leatherworking);

export default items;
