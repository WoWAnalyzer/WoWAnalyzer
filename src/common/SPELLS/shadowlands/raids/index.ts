import safeMerge from 'common/safeMerge';

import CastleNathria from './castlenathria';
import Fated from './fated';
import SanctumOfDomination from './sanctumofdomination';
import SepulcherOfTheFirstOnes from './sepulcherofthefirstones';

export default safeMerge(CastleNathria, SanctumOfDomination, SepulcherOfTheFirstOnes, Fated);
