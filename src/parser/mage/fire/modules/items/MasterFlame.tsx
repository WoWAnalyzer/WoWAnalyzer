import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const DAMAGE_BONUS = [0, .08, .09, .10, .10, .11, .12, .13, .14, .14, .15, .16, .17, .18, .18, .19];

class MasterFlame extends Analyzer {

  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.MASTER_FLAME.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.MASTER_FLAME.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAMESTRIKE), this.onFlameStrikeDamage);
  }

  onFlameStrikeDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event,DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <ConduitSpellText spell={SPELLS.MASTER_FLAME} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default MasterFlame;
