import React from 'react';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatThousands, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SigilOfFlame extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  statistic() {
    const sigilOfFlameUptime = this.enemies.getBuffUptime(SPELLS.SIGIL_OF_FLAME_DEBUFF.id);

    const sigilOfFlameUptimePercentage = sigilOfFlameUptime / this.owner.fightDuration;

    const sigilOfFlameDamage = this.abilityTracker.getAbility(SPELLS.SIGIL_OF_FLAME_DEBUFF.id).damageEffective;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIGIL_OF_FLAME.id} />}
        value={`${formatPercentage(sigilOfFlameUptimePercentage)}%`}
        label="Sigil of Flame Uptime"
        tooltip={`The Sigil of Flame total damage was ${formatThousands(sigilOfFlameDamage)}.<br/>The Sigil of Flame total uptime was ${formatDuration(sigilOfFlameUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(9);
}

export default SigilOfFlame;
