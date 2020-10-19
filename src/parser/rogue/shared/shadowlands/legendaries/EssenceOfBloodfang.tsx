import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemHealingDone from 'interface/ItemHealingDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class EssenceOfBloodfang extends Analyzer {
  bloodfangDamage: number = 0;
  bloodfangHealing: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.ESSENCE_OF_BLOODFANG.bonusID);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_OF_BLOODFANG_BUFF), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_OF_BLOODFANG_BUFF), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.bloodfangDamage += event.amount + (event.absorbed || 0);
  }

  onHeal(event: HealEvent) {
    this.bloodfangHealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.ESSENCE_OF_BLOODFANG}>
          <ItemDamageDone amount={this.bloodfangDamage} />
          <ItemHealingDone amount={this.bloodfangHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EssenceOfBloodfang;