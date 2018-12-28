import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { formatNumber } from 'common/format';
import ChiTracker from 'parser/monk/windwalker/modules/chi/ChiTracker';

/**
 * Rising Sun Kick has a 25% chance to trigger a second time, dealing 4950 Physical damage and restoring 1 Chi.
 */
class GloryOfTheDawn extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    chiTracker: ChiTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GLORY_OF_THE_DAWN.id);
  }
  
  get damageDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.GLORY_OF_THE_DAWN_HIT.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  get chiGain() {
    return this.chiTracker.getGeneratedBySpell(SPELLS.GLORY_OF_THE_DAWN_HIT.id);
  }
  
  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GLORY_OF_THE_DAWN.id}
        value={(
          <>
            {this.owner.formatItemDamageDone(this.damageDone)} <br />
            {this.chiGain} Chi Gained
          </>
        )}
        tooltip={`Damage done: ${formatNumber(this.damageDone)}`}
      />
    );
 	}
}

export default GloryOfTheDawn;