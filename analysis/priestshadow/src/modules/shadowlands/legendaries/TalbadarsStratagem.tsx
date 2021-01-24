import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const TALBADARS_STRATAGEM_INCREASE = 0.6;

class TalbadarsStratagem extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.TALBADARS_STRATAGEM.bonusID);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.SHADOW_WORD_PAIN.id) || !enemy.hasBuff(SPELLS.SHADOW_WORD_PAIN.id) || !enemy.hasBuff(SPELLS.DEVOURING_PLAGUE.id)) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, TALBADARS_STRATAGEM_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.TALBADARS_STRATAGEM}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TalbadarsStratagem;
