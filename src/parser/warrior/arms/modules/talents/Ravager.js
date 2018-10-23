import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Throws a whirling weapon at the target location that inflicts [ 309.6% of Attack Power ] damage 
 * to all enemies within 8 yards over 7 sec.
 */

class Ravager extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS.id);
    if (!this.active) {
      return;
    }
  }

  subStatistic() {
    const ravager = this.abilityTracker.getAbility(SPELLS.RAVAGER_DAMAGE.id);
    const total = ravager.damageEffective || 0;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.RAVAGER_TALENT_ARMS.id} /> damage</>}
        value={formatThousands(total)}
      />
    );
  }
}

export default Ravager;