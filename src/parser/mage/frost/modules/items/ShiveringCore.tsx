import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const DAMAGE_BONUS = [0, .08, .09, .10, .10, .11, .12, .13, .14, .14, .15, .16, .17, .18, .18, .19];

class ShiveringCore extends Analyzer {
  
  conduitRank = 0;
  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.SHIVERING_CORE.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SHIVERING_CORE.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLIZZARD_DAMAGE), this.onBlizzardDamage);
  }

  onBlizzardDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event.amount,DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SHIVERING_CORE}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShiveringCore;
