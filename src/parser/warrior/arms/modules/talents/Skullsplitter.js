import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Bash an enemy's skull, dealing [ 84% of Attack Power ] Physical damage.
 */

class Skullsplitter extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SKULLSPLITTER_TALENT.id);
  }

  subStatistic() {
    const Skullsplitter = this.abilityTracker.getAbility(SPELLS.SKULLSPLITTER_TALENT.id);
    const total = Skullsplitter.damageEffective || 0;
    const avg = total / (Skullsplitter.casts || 1);
    return (
      <StatisticListBoxItem
        title={<>Average <SpellLink id={SPELLS.SKULLSPLITTER_TALENT.id} /> damage</>}
        value={formatThousands(avg)}
        valueTooltip={`Total Skullsplitter damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default Skullsplitter;