import safeMerge from 'common/safeMerge';

import Dreamrift from './dreamrift';
import MarchOnQuelDanas from './march-on-queldanas';
import Voidspire from './voidspire';

const spells = safeMerge(Dreamrift, MarchOnQuelDanas, Voidspire);

export default spells;
