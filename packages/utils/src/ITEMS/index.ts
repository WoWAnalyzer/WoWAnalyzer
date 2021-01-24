import { ItemList } from "common/ITEMS/Item";

import indexById from '../indexById';
import safeMerge from '../safeMerge';

//Classes
import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import DRUID from './druid';
import HUNTER from './hunter';
import MAGE from './mage';
import MONK from './monk';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHAMAN from './shaman';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

//Non class-specific
import OTHERS from './others';
import SHADOWLANDS from './shadowlands';


const ITEMS: ItemList = {
  //Class items
  ...safeMerge(
    DEATH_KNIGHT,
    DEMON_HUNTER,
    DRUID,
    HUNTER,
    MAGE,
    MONK,
    PALADIN,
    PRIEST,
    ROGUE,
    SHAMAN,
    WARLOCK,
    WARRIOR,
  ),
  //Any non class-specific items
  ...safeMerge(
    OTHERS,
    SHADOWLANDS,
  ),
};

export default indexById(ITEMS);
