import safeMerge from 'common/safeMerge';

import Alchemy from './alchemy';
import Inscription from './inscription';

const items = safeMerge<typeof Alchemy & typeof Inscription>(Alchemy, Inscription);
export default items;
