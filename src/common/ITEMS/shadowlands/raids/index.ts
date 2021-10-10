import { ItemList } from 'common/ITEMS/Item';
import safeMerge from 'common/safeMerge';

import CastleNathria from './castlenathria';
import SanctumOfDomination from './sanctumofdomination';

const items: ItemList = safeMerge(CastleNathria, SanctumOfDomination);
export default items;
