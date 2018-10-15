import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class DrainSoul extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAIN_SOUL_TALENT.id);
  }

  subStatistic() {
    const ds = this.abilityTracker.getAbility(SPELLS.DRAIN_SOUL_TALENT.id);
    const damage = ds.damageEffective + ds.damageAbsorbed;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} /> damage</>}
        value={formatThousands(damage)}
        valueTooltip={this.owner.formatItemDamageDone(damage)}
      />
    );
  }
}

export default DrainSoul;
