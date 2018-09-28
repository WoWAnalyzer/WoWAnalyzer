import safeMerge from 'common/safeMerge';
import Dungeons from './Dungeons';
import Raids from './Raids';
import Potions from './Potions';
import Crafted from './Crafted';
import Enchants from './Enchants';
import Gems from './Gems';

export default safeMerge(Dungeons, Raids, Potions, Crafted, Enchants, Gems);
