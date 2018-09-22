import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'Interface/Others/StatisticListBoxItem';

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
        title={<React.Fragment>Average <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} /> damage</React.Fragment>}
        value={formatThousands(avg)}
        valueTooltip={`Total Deathbolt damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default Deathbolt;
