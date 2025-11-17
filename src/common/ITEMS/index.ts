import indexById from '../indexById';
import safeMerge from '../safeMerge';
import DEATH_KNIGHT from './deathknight';
import DEMON_HUNTER from './demonhunter';
import MIDNIGHT from './midnight';
import THEWARWITHIN from './thewarwithin';
import DRUID from './druid';
import EVOKER from './evoker';
import HUNTER from './hunter';
import Item, { CraftedItem, Enchant } from './Item';
import MAGE from './mage';
import MONK from './monk';
import OTHERS from './others';
import PALADIN from './paladin';
import PRIEST from './priest';
import ROGUE from './rogue';
import SHAMAN from './shaman';
import WARLOCK from './warlock';
import WARRIOR from './warrior';
import CLASSIC from './classic';
import gems from './gems';

const ITEMS = {
  //Class items
  ...safeMerge(
    DEATH_KNIGHT,
    DEMON_HUNTER,
    DRUID,
    EVOKER,
    HUNTER,
    MAGE,
    MONK,
    PALADIN,
    PRIEST,
    ROGUE,
    SHAMAN,
    WARLOCK,
    WARRIOR,
    CLASSIC,
  ),
  //Any non class-specific items
  ...safeMerge(OTHERS, THEWARWITHIN, MIDNIGHT, gems),
};

export default indexById<Item | Enchant | CraftedItem, typeof ITEMS>(ITEMS);

export * from './tier';
