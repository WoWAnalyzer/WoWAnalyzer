import indexById from './indexById';

import talents from './SPELLS_TALENTS';
import spells from './SPELLS_ABILITIES';
import traits from './SPELLS_TRAITS';
import racials from './SPELLS_RACIALS';

const ABILITIES = {
  ...talents,
  ...spells,
  ...traits,
  ...racials,
};

export default indexById(ABILITIES);
