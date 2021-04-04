import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

const DAMAGE_BONUS = [
  0,
  0.04,
  0.04,
  0.05,
  0.05,
  0.06,
  0.06,
  0.06,
  0.07,
  0.07,
  0.08,
  0.08,
  0.08,
  0.09,
  0.09,
  0.1,
];

class ControlledDestruction extends Analyzer {
  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.CONTROLLED_DESTRUCTION.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.CONTROLLED_DESTRUCTION.id,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST),
      this.onPyroDamage,
    );
  }

  onPyroDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <ConduitSpellText spell={SPELLS.CONTROLLED_DESTRUCTION} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default ControlledDestruction;
