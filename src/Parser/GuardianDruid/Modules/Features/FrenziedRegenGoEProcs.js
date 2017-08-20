import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

class FrenziedRegenGoEProcs extends Module {
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
    }
  }

  statistic() {
    const nonGoEFRegen = this.owner.modules.guardianOfEluneProcs.nonGoEIronFur;
    const GoEFRegen = this.owner.modules.guardianOfEluneProcs.GoEIronFur;
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
