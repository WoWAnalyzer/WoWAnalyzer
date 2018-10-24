import safeMerge from 'common/safeMerge';
import Dungeons from './dungeons';
import Raids from './raids';
import Potions from './potions';
import Crafted from './crafted';
import Enchants from './enchants';
import Gems from './gems';
import PVP from './pvp';

export default safeMerge(Dungeons, Raids, Potions, Crafted, Enchants, Gems, PVP);
