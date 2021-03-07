import { ItemList } from 'common/ITEMS/Item';
import safeMerge from 'common/safeMerge';

import Alchemy from './alchemy';
import Inscription from './inscription';

const items: ItemList = safeMerge(Alchemy, Inscription);
export default items;
