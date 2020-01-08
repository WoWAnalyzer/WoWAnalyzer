import safeMerge from 'common/safeMerge';
import Uldir from './uldir';
import BattleOfDazaralor from './battleofdazaralor';
import CrucibleOfStorms from './crucibleofstorms';
import AzsharasEternalPalace from './azsharaseternalpalace';
import NyalothaTheWakingCity from './nyalothathewakingcity';

export default safeMerge(Uldir, BattleOfDazaralor, CrucibleOfStorms, AzsharasEternalPalace, NyalothaTheWakingCity);
