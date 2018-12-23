import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class Deathbolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEATHBOLT_TALENT.id);
  }

  subStatistic() {
    const deathbolt = this.abilityTracker.getAbility(SPELLS.DEATHBOLT_TALENT.id);
    const total = deathbolt.damageEffective || 0;
    const avg = total / (deathbolt.casts || 1);
    return (
      <StatisticListBoxItem
        title={<>Average <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} /> damage</>}
        value={formatThousands(avg)}
        valueTooltip={`Total damage done with Deathbolt: ${formatThousands(total)} (${this.owner.formatItemDamageDone(total)})`}
      />
    );
  }
}

export default Deathbolt;
