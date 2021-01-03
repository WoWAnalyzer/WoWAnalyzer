import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const DAMAGE_BONUS = [
  0,
  0.15,
  0.17,
  0.18,
  0.2,
  0.21,
  0.23,
  0.24,
  0.26,
  0.27,
  0.29,
  0.3,
  0.32,
  0.33,
  0.35,
  0.36,
];

class UnrelentingCold extends Analyzer {
  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.UNRELENTING_COLD.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.UNRELENTING_COLD.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROZEN_ORB_DAMAGE),
      this.onFrozenOrbDamage,
    );
  }

  onFrozenOrbDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <ConduitSpellText spell={SPELLS.UNRELENTING_COLD} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default UnrelentingCold;
