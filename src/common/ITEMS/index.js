import indexById from '../indexById';
import safeMerge from '../safeMerge';

import OTHERS from './others';
import BFA from './bfa';
import SHADOWLANDS from './shadowlands';

export default indexById(
  safeMerge(
    OTHERS,
    BFA,
    SHADOWLANDS,
  ),
);
