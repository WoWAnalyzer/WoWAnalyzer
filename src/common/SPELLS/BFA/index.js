import safeMerge from 'common/safeMerge';
import Dungeons from './Dungeons';
import Raids from './Raids';
import AzeriteTraits from './AzeriteTraits';
import Enchants from './Enchants';

export default safeMerge(Dungeons, Raids, AzeriteTraits, Enchants);
