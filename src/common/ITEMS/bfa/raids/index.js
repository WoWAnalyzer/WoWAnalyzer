import safeMerge from 'common/safeMerge';
import Uldir from './uldir';
import bod from './bod';
import CrucibleOfStorms from './crucibleofstorms';
import AzsharasEternalPalace from './azsharaseternalpalace';
import NyalothaTheWakingCity from './nyalothathewakingcity';

export default safeMerge(Uldir, bod, CrucibleOfStorms, AzsharasEternalPalace, NyalothaTheWakingCity);
