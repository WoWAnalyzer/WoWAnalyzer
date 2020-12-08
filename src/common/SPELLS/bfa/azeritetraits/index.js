import safeMerge from 'common/safeMerge';

import General from './general';
import Paladin from './paladin';
import Shaman from './shaman';
import Warlock from './warlock';
import Priest from './priest';
import Warrior from './warrior';
import Rogue from './rogue';

export default safeMerge(General, Paladin, Shaman, Warlock, Priest, Warrior, Rogue);
