import safeMerge from 'common/safeMerge';

import { ItemList } from 'common/ITEMS/Item';

import Alchemy from './alchemy';
import Inscription from './inscription';

const items: ItemList = safeMerge(Alchemy, Inscription);
export default items;
