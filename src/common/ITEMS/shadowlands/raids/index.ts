import safeMerge from 'common/safeMerge';

import CastleNathria from './castlenathria';


const items = safeMerge<typeof CastleNathria>(CastleNathria);
export default items;