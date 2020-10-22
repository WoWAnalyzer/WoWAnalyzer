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

export const DAMAGE_BONUS: {[rank: number]: number } = {
  1: .05,
  2: .06,
  3: .07,
  4: .08,
  5: .09,
  6: .10,
  7: .11,
  8: .13,
  9: .14,
  10: .15,
  11: .16,
  12: .17,
  13: .18,
  14: .19,
  15: .2,
};

class ControlledDestruction extends Analyzer {

  conduitRank: number = 0;

  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.CONTROLLED_DESTRUCTION.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.CONTROLLED_DESTRUCTION.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST), this.onPyroDamage);
  }

  onPyroDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event,DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.CONTROLLED_DESTRUCTION}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ControlledDestruction;
