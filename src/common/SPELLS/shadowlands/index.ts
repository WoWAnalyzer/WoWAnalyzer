import safeMerge from 'common/safeMerge';

import Conduits from './conduits';
import Covenants from './covenants';
import Legendaries from './legendaries';
import Enchants from './enchants';
import Potions from './potions';
import Others from './others';

export default safeMerge(Conduits, Covenants, Legendaries, Enchants, Potions, Others);
