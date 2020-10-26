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

const DAMAGE_BONUS: {[rank: number]: number } = {
  1: .05,
  2: .0625,
  3: .075,
  4: .0875,
  5: .1,
  6: .1125,
  7: .125,
  8: .1375,
  9: .15,
  10: .1625,
  11: .175,
  12: .1875,
  13: .2,
  14: .2125,
  15: .25,
};

class ShiveringCore extends Analyzer {
  conduitRank: number = 0;

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
