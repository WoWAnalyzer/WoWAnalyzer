import indexById from '../indexById';
import safeMerge from '../safeMerge';
import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import DRUID from './druid';
import HUNTER from './hunter';
import Item, { Enchant } from './Item';
import MAGE from './mage';
import MONK from './monk';
import OTHERS from './others';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHADOWLANDS from './shadowlands';
import SHAMAN from './shaman';
import WARLOCK from './warlock';
import WARRIOR from './warrior';

const ITEMS = {
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
  ...safeMerge(OTHERS, SHADOWLANDS),
};

export default indexById<Item | Enchant, typeof ITEMS>(ITEMS);
