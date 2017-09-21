import React from 'react';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatThousands, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ImmolationAura extends Module {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };
  statistic() {
    const immolationAuraUptime = this.combatants.selected.getBuffUptime(SPELLS.IMMOLATION_AURA.id);

    const immolationAuraUptimePercentage = immolationAuraUptime / this.owner.fightDuration;

    this.immolationAuraDamage = this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA_FIRST_STRIKE.id).damageEffective + this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA_BUFF.id).damageEffective;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IMMOLATION_AURA.id} />}
        value={`${formatPercentage(immolationAuraUptimePercentage)}%`}
        label="Immolation Aura Uptime"
        tooltip={`The Immolation Aura total damage was ${formatThousands(this.immolationAuraDamage)}.<br/>The Immolation Aura total uptime was ${formatDuration(immolationAuraUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default ImmolationAura;
