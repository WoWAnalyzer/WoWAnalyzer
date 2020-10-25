import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

class EarthenRage extends Analyzer {
  damageGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EARTHEN_RAGE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EARTHEN_RAGE_DAMAGE), this.onERDamage);
  }

  onERDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.EARTHEN_RAGE_DAMAGE}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EarthenRage;
