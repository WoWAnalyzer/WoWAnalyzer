import safeMerge from 'common/safeMerge';

import Crafted from './crafted';
import Dungeons from './dungeons';
import Enchants from './enchants';
import Gems from './gems';
import Legendaries from './legendaries';
import Potions from './potions';
import Others from './others';
import PVP from './pvp';
import Raids from './raids';


const items = safeMerge<typeof Crafted & typeof Dungeons & typeof Enchants
  & typeof Gems & typeof Legendaries & typeof Potions & typeof Others & typeof PVP
  & typeof Raids>(Crafted, Dungeons, Enchants, Gems, Legendaries, Potions, Others, PVP, Raids);
export default items;
