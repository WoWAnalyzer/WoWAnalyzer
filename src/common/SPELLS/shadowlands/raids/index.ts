import safeMerge from 'common/safeMerge';

import CastleNathria from './castlenathria';
import SanctumOfDomination from './sanctumofdomination';
import SepulcherOfTheFirstOnes from './sepulcherofthefirstones';

const raidSpells = safeMerge(CastleNathria, SanctumOfDomination, SepulcherOfTheFirstOnes);
export default raidSpells;
