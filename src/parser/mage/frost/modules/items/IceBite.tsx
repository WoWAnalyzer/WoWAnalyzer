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
import Enemies from 'parser/shared/modules/Enemies';

import { SHATTER_DEBUFFS } from 'parser/mage/shared/constants';

const DAMAGE_BONUS = [0, .04, .044, .048, .052, .056, .06, .064, .068, .072, .076, .08, .084, .088, .092, .096];

class IceBite extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  }
  protected enemies!: Enemies;

  conduitRank = 0;
  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ICE_BITE.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ICE_BITE.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE), this.onIceLanceDamage);
  }

  onIceLanceDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && SHATTER_DEBUFFS.some(effect => enemy.hasBuff(effect.id, event.timestamp))) {
      this.bonusDamage += calculateEffectiveDamage(event,DAMAGE_BONUS[this.conduitRank]);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ICE_BITE}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceBite;
