import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

class FortifyingIngredients extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
  };

  /**
   * Whenever you cast fort brew you gain a shield for x% of your hp
   */
  constructor(...args) {
    super(...args);

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.FORTIFYING_INGREDIENTS.id);
    if (!conduitRank) {
      this.active = false;
      return;
    }
  }

  statistic() {
    const shield = this.healingDone.byAbility(SPELLS.FORTIFYING_INGREDIENTS.id).effective;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.FORTIFYING_INGREDIENTS}>
          <ItemHealingDone amount={shield} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FortifyingIngredients;
