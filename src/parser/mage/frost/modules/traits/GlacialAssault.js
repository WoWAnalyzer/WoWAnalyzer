import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';

class GlacialAssault extends Analyzer {

  totalDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GLACIAL_ASSAULT_TRAIT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_ASSAULT_DAMAGE), this.onGADamage);
  }

  onGADamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.GLACIAL_ASSAULT_TRAIT.id}
        value={this.owner.formatItemDamageDone(this.totalDamage)}
        tooltip={`Total damage: ${formatNumber(this.totalDamage)}`}
      />
    );
  }
}

export default GlacialAssault;
