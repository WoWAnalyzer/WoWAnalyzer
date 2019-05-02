import safeMerge from 'common/safeMerge';
import Uldir from './uldir';
import BattleOfDazaralor from './battleofdazaralor';
import CrucibleOfStorms from './crucibleofstorms';

export default safeMerge(Uldir, BattleOfDazaralor, CrucibleOfStorms);
