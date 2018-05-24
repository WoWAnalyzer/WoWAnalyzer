import safeMerge from 'common/safeMerge';
import Dungeons from './Dungeons';
import Raids from './Raids';
import Potions from './Potions';
import Crafted from './Crafted';

export default safeMerge(Dungeons, Raids, Potions, Crafted);
