import safeMerge from 'common/safeMerge';

import General from './general';
import Shaman from './shaman';
import Warlock from './warlock';
import Priest from './priest';
import Warrior from './warrior';
import Rogue from './rogue';

export default safeMerge(General, Shaman, Warlock, Priest, Warrior, Rogue);
