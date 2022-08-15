import safeMerge from 'common/safeMerge';
import { SpellList } from 'common/SPELLS/Spell';

import CastleNathria from './castlenathria';
import SanctumOfDomination from './sanctumofdomination';
import SepulcherOfTheFirstOnes from './sepulcherofthefirstones';

const raidSpells: SpellList = safeMerge(
  CastleNathria,
  SanctumOfDomination,
  SepulcherOfTheFirstOnes,
);
export default raidSpells;
