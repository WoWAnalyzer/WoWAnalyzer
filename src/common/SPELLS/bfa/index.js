import safeMerge from 'common/safeMerge';
import Dungeons from './dungeons';
import Raids from './raids';
import AzeriteTraits from './azeritetraits';
import Enchants from './enchants';
import Potions from './potions';
import Crafted from './crafted';
import PVP from './pvp';
import Essences from './essences';
import Corruption from './corruption';

export default safeMerge(Dungeons, Raids, AzeriteTraits, Enchants, Potions, Crafted, PVP, Essences, Corruption);
