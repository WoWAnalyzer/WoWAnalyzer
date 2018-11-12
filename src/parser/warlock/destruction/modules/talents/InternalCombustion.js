import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

/*
  Internal Combustion (Tier 30 Destruction talent):
    Chaos Bolt consumes up to 5 sec of Immolate's damage over time effect on your target, instantly dealing that much damage.
 */
class InternalCombustion extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INTERNAL_COMBUSTION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.INTERNAL_COMBUSTION_DAMAGE.id) {
      return;
    }

    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.INTERNAL_COMBUSTION_TALENT.id} /> damage</>}
        value={formatThousands(this.damage)}
        valueTooltip={this.owner.formatItemDamageDone(this.damage)}
      />
    );
  }
}

export default InternalCombustion;
