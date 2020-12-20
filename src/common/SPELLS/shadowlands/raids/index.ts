import safeMerge from 'common/safeMerge';

import CastleNathria from './castlenathria';

const raidSpells = safeMerge<typeof CastleNathria>(CastleNathria);
  
export default raidSpells;