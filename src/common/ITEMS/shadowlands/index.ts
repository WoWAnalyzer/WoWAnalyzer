import { ItemList } from 'common/ITEMS/Item';
import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Dungeons from './dungeons';
import Enchants from './enchants';
import Gems from './gems';
import Legendaries from './legendaries';
import Others from './others';
import Potions from './potions';
import PVP from './pvp';
import Raids from './raids';

const items: ItemList = safeMerge(
  Crafted,
  Dungeons,
  Enchants,
  Gems,
  Legendaries,
  Potions,
  Others,
  PVP,
  Raids,
);
export default items;
