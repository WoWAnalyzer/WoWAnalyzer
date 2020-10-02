import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellIcon from 'common/SpellIcon';

class AkaarisSoulFragment extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  damage: number = 0;
  protected abilities!: Abilities;

  constructor(options: any) {
    super(options);
    // this.active = this.selectedCombatant.hasLegendaryByBonusID();
    this.active = true;
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AKAARIS_SOUL_FRAGMENT_SHADOWSTRIKE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <>
        <StatisticBox
          position={STATISTIC_ORDER.CORE()}
          category={STATISTIC_CATEGORY.ITEMS}
          icon={<SpellIcon id={SPELLS.AKAARIS_SOUL_FRAGMENT.id} />}
          value={<ItemDamageDone amount={this.damage} />}
          label="Total Damage Contributed"
        />
      </>
    );
  }
}

export default AkaarisSoulFragment;
