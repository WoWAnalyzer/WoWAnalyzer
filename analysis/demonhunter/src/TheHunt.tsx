import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { formatThousands } from 'common/format';


/**
 * Night Fae - The Hunt
 */
class TheHunt extends Analyzer {

  damage = 0;
  heal = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.THE_HUNT_CHARGE, SPELLS.THE_HUNT_DOT]), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.THE_HUNT_HEAL]), this.onHeal);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onHeal(event: HealEvent) {
    this.heal += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage
            {formatThousands(this.heal)} Total heal
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.THE_HUNT}>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ItemHealingDone amount={this.heal} />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default TheHunt;
