import safeMerge from 'common/safeMerge';

import General from './general';
import Shaman from './shaman';
import Warlock from './warlock';
import Warrior from './warrior';

export default safeMerge(General, Shaman, Warlock, Warrior);
