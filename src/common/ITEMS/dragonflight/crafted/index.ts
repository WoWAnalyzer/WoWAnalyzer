import safeMerge from 'common/safeMerge';

import Alchemy from './alchemy';
import Inscription from './inscription';
import Leatherworking from './leatherworking';
import Engineering from './engineering';
import Jewelcrafting from './jewelcrafting';

const items = safeMerge(Alchemy, Engineering, Inscription, Leatherworking, Jewelcrafting);

export default items;
