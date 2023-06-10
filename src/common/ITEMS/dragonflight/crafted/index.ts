import safeMerge from 'common/safeMerge';

import Alchemy from './alchemy';
import Inscription from './inscription';
import Leatherworking from './leatherworking';
import Engineering from './engineering';

const items = safeMerge(Alchemy, Engineering, Inscription, Leatherworking);

export default items;
