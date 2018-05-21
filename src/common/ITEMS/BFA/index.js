import safeMerge from 'common/safeMerge';
import Dungeons from './Dungeons';
import Raids from './Raids';
import Potions from './Potions';
import Others from './Others';

export default safeMerge(Dungeons, Raids, Potions, Others);
