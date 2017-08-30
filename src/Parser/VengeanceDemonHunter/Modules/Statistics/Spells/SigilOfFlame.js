import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatThousands } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SigilOfFlame extends Module {

  statistic() {

    const sigilOfFlameUptime = this.owner.modules.enemies.getBuffUptime(SPELLS.SIGIL_OF_FLAME_DEBUFF.id);

    const sigilOfFlameUptimePercentage = sigilOfFlameUptime / this.owner.fightDuration;

    if(this.owner.modules.abilityTracker.abilities[SPELLS.SIGIL_OF_FLAME_DEBUFF.id]) {
      this.sigilOfFlameDamage = this.owner.modules.abilityTracker.abilities[SPELLS.SIGIL_OF_FLAME_DEBUFF.id].damangeEffective;
    }


    return (
      <StatisticBox
        icon={<Icon icon="ability_demonhunter_sigilofinquisition" alt="Sigil of Flame" />}
        value={`${formatPercentage(sigilOfFlameUptimePercentage)}%`}
        label='Sigil of Flame Uptime'
        tooltip={`The Sigil of Flame total damage was ${formatThousands(this.sigilOfFlameDamage)}.<br/>The Sigil of Flame total uptime was ${formatDuration(sigilOfFlameUptime / 1000)} seconds.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(9);
}

export default SigilOfFlame;
