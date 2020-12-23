import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events from 'parser/core/Events';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemManaGained from 'interface/ItemManaGained';
import ItemHealingDone from 'interface/ItemHealingDone';

import { conduitScaling } from '../../../mistweaver/constants';

class GroundingBreath extends Analyzer {

  healing = 0;
  resourceReturned = 0;

  healingBoost = 0;

  /**
   * Increase vivify healing on yourself by x% and has a 30% chance to refund any vivify.
   */
  constructor(...args) {
    super(...args);

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.GROUNDING_BREATH.id);
    
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.healingBoost = conduitScaling(.15, conduitRank);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivifyBoost);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell([SPELLS.GROUNDING_BREATH_MANA_RETURN, SPELLS.GROUNDING_BREATH_ENERGY_RETURN]), this.onResourceRefund);
  }

  vivifyBoost(event) {
    if (event.targetID !== event.sourceID) {
      return;
    }
    this.healing += (calculateEffectiveHealing(event, this.healingBoost) || 0);
  }

  onResourceRefund(event) {
    this.resourceReturned += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.GROUNDING_BREATH}>
          <ItemManaGained amount={this.resourceReturned} />
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GroundingBreath;
