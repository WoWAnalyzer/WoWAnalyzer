import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

class SoulFire extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_FIRE_TALENT.id);
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.SOUL_FIRE_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.SOUL_FIRE_TALENT.id} /> damage</>}
        value={this.owner.formatItemDamageDone(damage)}
        valueTooltip={`${formatThousands(damage)} damage`}
      />
    );
  }
}

export default SoulFire;
