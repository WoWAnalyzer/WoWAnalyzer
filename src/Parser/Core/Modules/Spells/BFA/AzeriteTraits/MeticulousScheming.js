import React from 'react';

import SPELLS from 'common/SPELLS';
import SecondaryStatProcTrait from 'Parser/Core/Modules/Spells/BFA/AzeriteTraits/SecondaryStatProcTrait';

class MeticulousScheming extends SecondaryStatProcTrait {
  constructor(...args) {
    super(
      SPELLS.METICULOUS_SCHEMING.id,
      SPELLS.METICULOUS_SCHEMING.name,
      SPELLS.METICULOUS_SCHEMING.icon,
      SPELLS.SEIZE_THE_MOMENT.id,
      [SecondaryStatProcTrait.CRIT, SecondaryStatProcTrait.VERSA, SecondaryStatProcTrait.MASTERY, SecondaryStatProcTrait.HASTE],
      ...args
    );
  }
}

export default MeticulousScheming;
