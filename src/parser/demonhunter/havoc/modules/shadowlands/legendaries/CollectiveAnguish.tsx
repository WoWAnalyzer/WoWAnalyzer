import React from 'react';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatThousands } from 'common/format';

class CollectiveAnguish extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.COLLECTIVE_ANGUISH.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_DEVESTATION_DAMAGE), this.onDamageEvent);
  }

  onDamageEvent(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.COLLECTIVE_ANGUISH}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CollectiveAnguish;
