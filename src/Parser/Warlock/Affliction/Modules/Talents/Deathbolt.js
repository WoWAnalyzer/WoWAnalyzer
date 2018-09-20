import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox from 'Interface/Others/StatisticBox';

class Deathbolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEATHBOLT_TALENT.id);
  }

  statistic() {
    const deathbolt = this.abilityTracker.getAbility(SPELLS.DEATHBOLT_TALENT.id);
    const total = deathbolt.damageEffective || 0;
    const avg = total / (deathbolt.casts || 1);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEATHBOLT_TALENT.id} />}
        value={formatThousands(avg)}
        label="Average Deathbolt damage"
        tooltip={`Total Deathbolt damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default Deathbolt;
