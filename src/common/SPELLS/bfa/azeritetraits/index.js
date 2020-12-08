import safeMerge from 'common/safeMerge';

import General from './general';
import Paladin from './paladin';
import Shaman from './shaman';
import Warlock from './warlock';
import Monk from './monk';
import Priest from './priest';
import Druid from './druid';
import Warrior from './warrior';
import Rogue from './rogue';
import Demonhunter from './demonhunter';

export default safeMerge(General, Paladin, Shaman, Warlock, Monk, Priest, Druid, Warrior, Rogue,Demonhunter);
