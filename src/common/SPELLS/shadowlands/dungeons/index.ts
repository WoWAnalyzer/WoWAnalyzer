import safeMerge from 'common/safeMerge';

import ITEMS from './items';

const dungeonSpells = safeMerge<typeof ITEMS>(ITEMS);
export default dungeonSpells;
