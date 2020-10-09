import React from 'react';

import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import { formatPercentage, formatThousands } from 'common/format';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';

const LASHING_FLAMES_BONUS = 1;

/**
 * Lava Lash now increases the damage of Flame Shock on its target by 100% for 12 sec.
 *
 * Example Log:
 *
 */
class LashingFlames extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  protected buffedFlameShockDmg: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.LASHING_FLAMES_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.FLAME_SHOCK),
      this.onFlameShockDamage,
    );
  }

  onFlameShockDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }

    if (!enemy.hasBuff(SPELLS.LASHING_FLAMES_DEBUFF.id, event.timestamp)) {
      return;
    }

    this.buffedFlameShockDmg += calculateEffectiveDamage(event, LASHING_FLAMES_BONUS);
  }

  statistic() {
    return (
      <StatisticBox
        label={<SpellLink id={SPELLS.LASHING_FLAMES_TALENT.id} />}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL()}
        tooltip={(
          <>
            Lashing Flames contributed {formatThousands(this.buffedFlameShockDmg)} total Flame Shock damage ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.buffedFlameShockDmg))} %).<br />
          </>
        )}
        value={(
          <div>
            <ItemDamageDone amount={this.buffedFlameShockDmg} />
          </div>
        )}
      />
    );
  }
}

export default LashingFlames;
