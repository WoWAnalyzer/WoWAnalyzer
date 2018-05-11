import safeMerge from 'common/safeMerge';
import Dungeons from './Dungeons';
import Raids from './Raids';
import AzeritePower from './AzeritePower';

export default safeMerge(Dungeons, Raids, AzeritePower);
