import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

import { TALBADARS_STRATAGEM_INCREASE } from '@wowanalyzer/priest-shadow/src/constants';

class TalbadarsStratagem extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.TALBADARS_STRATAGEM.bonusID);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (
      !enemy ||
      !enemy.hasBuff(SPELLS.SHADOW_WORD_PAIN.id) ||
      !enemy.hasBuff(SPELLS.SHADOW_WORD_PAIN.id) ||
      !enemy.hasBuff(SPELLS.DEVOURING_PLAGUE.id)
    ) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, TALBADARS_STRATAGEM_INCREASE);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.TALBADARS_STRATAGEM.id}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TalbadarsStratagem;
