import Enchants from './enchants';
import Gems from './gems';
import safeMerge from 'common/safeMerge';

const items = safeMerge(Enchants, Gems);

export default items;
export * from './tier';
