import { ItemList } from 'common/ITEMS/Item';
import safeMerge from 'common/safeMerge';

import CastleNathria from './castlenathria';
import SanctumOfDomination from './sanctumofdomination';
import SepulcherOfTheFirstOnes from './sepulcherofthefirstones';

const items: ItemList = safeMerge(CastleNathria, SanctumOfDomination, SepulcherOfTheFirstOnes);
export default items;
