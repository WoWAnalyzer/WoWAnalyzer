import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import StatTracker from 'parser/shared/modules/StatTracker';

class IgneousPotential extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  damageGained = 0;
  traitBonus = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.IGNEOUS_POTENTIAL.id);
    if (!this.active) {
      return;
    }
    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.IGNEOUS_POTENTIAL.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.IGNEOUS_POTENTIAL.id, rank)[0], 0);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LAVA_BURST_DAMAGE), this._onLavaBurst);
  }

  _onLavaBurst(event) {
    this.damageGained += calculateBonusAzeriteDamage(event, [this.traitBonus], SPELLS.LAVA_BURST.coefficient, this.statTracker.currentIntellectRating)[0];
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.IGNEOUS_POTENTIAL.id}
        value={<ItemDamageDone amount={this.damageGained} />}
        tooltip={`Igneous Potential did ${formatNumber(this.damageGained)} damage. Additional procs gained by the Lava Surge part are not calculated.`}
      />
    );
  }
}

export default IgneousPotential;
