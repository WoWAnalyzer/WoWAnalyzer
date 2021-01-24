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
import Enemies from 'parser/shared/modules/Enemies';

import { SHATTER_DEBUFFS } from '@wowanalyzer/mage';

const DAMAGE_BONUS = [
  0,
  0.04,
  0.044,
  0.048,
  0.052,
  0.056,
  0.06,
  0.064,
  0.068,
  0.072,
  0.076,
  0.08,
  0.084,
  0.088,
  0.092,
  0.096,
];

class IceBite extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ICE_BITE.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ICE_BITE.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE),
      this.onIceLanceDamage,
    );
  }

  onIceLanceDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, event.timestamp))) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank]);
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <ConduitSpellText spell={SPELLS.ICE_BITE} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default IceBite;
