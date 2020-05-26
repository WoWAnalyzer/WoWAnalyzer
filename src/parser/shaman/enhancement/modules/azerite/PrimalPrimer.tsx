import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { calculateAzeriteEffects } from 'common/stats';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

/**
 *
 * Melee attacks with Flametongue active increase the damage the target takes
 * from your next Lava Lash by ..., stacking up to 10 times.
 *
 * Example Log: https://www.warcraftlogs.com/reports/xpmYarXB3Afn26LG#fight=28&type=summary&source=10
 *
 */
class PrimalPrimer extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  protected enemies!: EnemyInstances;

  protected damageGained = 0;
  protected bonusDamagePerStack = 0;

  constructor(options: any) {
    super(options);

    if (!this.selectedCombatant.hasTrait(SPELLS.PRIMAL_PRIMER_TRAIT.id)) {
      this.active = false;
      return;
    }

    this.bonusDamagePerStack= this.selectedCombatant.traitsBySpellId[SPELLS.PRIMAL_PRIMER_TRAIT.id]
      .reduce((total, rank) => {
        return total + calculateAzeriteEffects(SPELLS.PRIMAL_PRIMER_TRAIT.id, rank)[0];
      }, 0);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.LAVA_LASH),
      this.onLavaLashDamage,
    );
  }

  onLavaLashDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target || !target.hasBuff(SPELLS.PRIMAL_PRIMER_DEBUFF.id)) {
      return;
    }

    const stacks = target.getBuff(SPELLS.PRIMAL_PRIMER_DEBUFF.id).stacks;

    this.damageGained += this.bonusDamagePerStack * stacks;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.PRIMAL_PRIMER_TRAIT}>
          <ItemDamageDone amount={this.damageGained} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimalPrimer;
