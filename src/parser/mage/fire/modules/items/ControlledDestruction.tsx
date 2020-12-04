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

const DAMAGE_BONUS = [0, .04, .04, .05, .05, .06, .06, .06, .07, .07, .08, .08, .08, .09, .09, .10];

class ControlledDestruction extends Analyzer {

  conduitRank = 0;
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
