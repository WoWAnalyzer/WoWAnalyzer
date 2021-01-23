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

const DAMAGE_BONUS = [0, .15, .17, .18, .20, .21, .23, .24, .26, .27, .29, .30, .32, .33, .35, .36];

class UnrelentingCold extends Analyzer {

  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.UNRELENTING_COLD.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.UNRELENTING_COLD.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROZEN_ORB_DAMAGE), this.onFrozenOrbDamage);
  }

  onFrozenOrbDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event,DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <ConduitSpellText spell={SPELLS.UNRELENTING_COLD} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default UnrelentingCold;
