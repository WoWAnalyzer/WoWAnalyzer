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
import Item, { Enchant } from './Item';


const ITEMS = {
  //Class items
  ...safeMerge<typeof DEATH_KNIGHT & typeof DEMON_HUNTER & typeof DRUID
    & typeof HUNTER & typeof MAGE & typeof MONK & typeof PALADIN
    & typeof PRIEST & typeof ROGUE & typeof SHAMAN
    & typeof WARLOCK & typeof WARRIOR>(
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
  ...safeMerge<typeof OTHERS & typeof SHADOWLANDS>(
    OTHERS,
    SHADOWLANDS,
  ),
} as const;

const ids = indexById(ITEMS);

const ITEMLIST: typeof ITEMS & Record<number, Item | Enchant> = {
  ...ITEMS,
  ...ids,
} as const;

export default ITEMLIST;
