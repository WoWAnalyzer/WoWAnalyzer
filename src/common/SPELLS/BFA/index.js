import safeMerge from 'common/safeMerge';
import Dungeons from './Dungeons';
import Raids from './Raids';
import AzeriteTraits from './AzeriteTraits';

export default safeMerge(Dungeons, Raids, AzeriteTraits);
