import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class GrimoireOfSacrifice extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id);
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.GRIMOIRE_OF_SACRIFICE_DAMAGE.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> damage</>}
        value={formatThousands(damage)}
        valueTooltip={this.owner.formatItemDamageDone(damage)}
      />
    );
  }
}

export default GrimoireOfSacrifice;
