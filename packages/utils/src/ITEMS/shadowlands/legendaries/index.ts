import safeMerge from 'common/safeMerge';

import { ItemList } from "common/ITEMS/Item";

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


const legendaries: ItemList = safeMerge(
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
);
export default legendaries;
