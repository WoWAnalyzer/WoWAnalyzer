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
  1: .1,
  2: .12,
  3: .14,
  4: .16,
  5: .18,
  6: .2,
  7: .22,
  8: .24,
  9: .26,
  10: .28,
  11: .3,
  12: .32,
  13: .34,
  14: .36,
  15: .4,
};

class UnrelentingCold extends Analyzer {
  conduitRank: number = 0;

  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.UNRELENTING_COLD.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.UNRELENTING_COLD.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROZEN_ORB_DAMAGE), this.onFrozenOrbDamage);
  }

  onFrozenOrbDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event,DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.UNRELENTING_COLD}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UnrelentingCold;
