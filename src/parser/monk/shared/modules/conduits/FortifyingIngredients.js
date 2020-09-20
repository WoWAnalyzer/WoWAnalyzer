import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';

class FortifyingIngredients extends Analyzer {

  shield = 0;

  /**
   * Whenever you cast fort brew you gain a shield for x% of your hp
   */
  constructor(...args) {
    super(...args);
    this.active = true;//this.selectedCombatant.hasConduit(SPELLS.FORTIFYING_INGREDIENTS.id);

    if (!this.active) {
      return;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FORTIFYING_INGREDIENTS_SHIELD), this.addShield);
  }

  addShield(event) {
    this.shield += (event.absorb || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.FORTIFYING_INGREDIENTS}>
          <>
            <ItemHealingDone amount={this.shield} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FortifyingIngredients;