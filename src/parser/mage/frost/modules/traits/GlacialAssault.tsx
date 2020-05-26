import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Events, { DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class GlacialAssault extends Analyzer {

  totalDamage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GLACIAL_ASSAULT_TRAIT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_ASSAULT_DAMAGE), this.onGADamage);
  }

  onGADamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={`Total damage: ${formatNumber(this.totalDamage)}`}
      >
        <BoringSpellValueText spell={SPELLS.GLACIAL_ASSAULT_TRAIT}>
          <>
            {this.owner.formatItemDamageDone(this.totalDamage)}%
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlacialAssault;
