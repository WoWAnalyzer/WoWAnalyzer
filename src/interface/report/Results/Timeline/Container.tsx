import React from 'react';

import usePremium from 'common/usePremium';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
// import SpellUsable from 'parser/shared/modules/SpellUsable';
// import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import CombatLogParser from 'parser/core/CombatLogParser';

import Component from './Component';

interface Props {
  parser: CombatLogParser;
}

const Container = ({ parser }: Props) => {
  const premium = usePremium();

  return (
    <Component
      parser={parser}
      abilities={parser.getModule(Abilities)}
      buffs={parser.getModule(Buffs)}
      premium={premium}
      // isAbilityCooldownsAccurate={parser.getModule(SpellUsable).isAccurate}
      // isGlobalCooldownAccurate={parser.getModule(GlobalCooldown).isAccurate}
    />
  );
};

export default Container;
