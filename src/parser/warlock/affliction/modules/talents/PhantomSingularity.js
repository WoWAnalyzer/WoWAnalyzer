import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class PhantomSingularity extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id);
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.PHANTOM_SINGULARITY_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.PHANTOM_SINGULARITY_TALENT.id} /> damage</>}
        value={this.owner.formatItemDamageDone(damage)}
        valueTooltip={`${formatThousands(damage)} damage`}
      />
    );
  }
}

export default PhantomSingularity;
