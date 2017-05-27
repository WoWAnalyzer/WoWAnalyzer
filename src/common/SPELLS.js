import indexById from './indexById';

import talents from './SPELLS_TALENTS';
import others from './SPELLS_OTHERS';
import traits from './SPELLS_TRAITS';
import racials from './SPELLS_RACIALS';

import paladin from './SPELLS_PALADIN';
import priest from './SPELLS_PRIEST';
import druid from './SPELLS_DRUID';
import monk from './SPELLS_MONK';

const ABILITIES = {
  ...talents,
  ...others,
  ...traits,
  ...racials,
  ...paladin,
  ...priest,
  ...druid,
  ...monk,
};

export default indexById(ABILITIES);
