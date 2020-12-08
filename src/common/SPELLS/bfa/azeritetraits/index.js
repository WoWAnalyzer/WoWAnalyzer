import safeMerge from 'common/safeMerge';

import General from './general';
import Warlock from './warlock';
import Warrior from './warrior';

export default safeMerge(General, Warlock, Warrior);
