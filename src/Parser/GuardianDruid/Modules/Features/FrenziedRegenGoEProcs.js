import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import GuardianOfElune from './GuardianOfElune';

class FrenziedRegenGoEProcs extends Module {
  static dependencies = {
    combatants: Combatants,
    guardianOfElune: GuardianOfElune,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
  }

  statistic() {
    const nonGoEFRegen = this.guardianOfElune.nonGoEFRegen;
    const GoEFRegen = this.guardianOfElune.GoEFRegen;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FRENZIED_REGENERATION.id} />}
        value={`${formatPercentage(nonGoEFRegen/(nonGoEFRegen + GoEFRegen))}%`}
        label='Unbuffed Frenzied Regen'
        tooltip={`You cast <b>${nonGoEFRegen + GoEFRegen}</b> total ${SPELLS.FRENZIED_REGENERATION.name} and <b> ${GoEFRegen}</b> were buffed by 20%.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default FrenziedRegenGoEProcs;
