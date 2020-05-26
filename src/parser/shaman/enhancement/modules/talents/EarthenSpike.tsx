import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

const EARTHEN_SPIKE = {
  INCREASE: 0.2,
};

/**
 * Summons an Earthen Spike under an enemy, dealing (108% of Attack power)
 * Physical damage and increasing Physical and Nature damage you deal
 * to the target by 20% for 10 sec.
 *
 * Example Log:
 *
 */
class EarthenSpike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  protected damageGained: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.EARTHEN_SPIKE_TALENT),
      this.onEarthenSpikeDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER),
      this.onAnyDamage,
    );
  }

  onEarthenSpikeDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onAnyDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }

    if (!enemy.hasBuff(SPELLS.EARTHEN_SPIKE_TALENT.id)) {
      return;
    }

    if (!this.buffedSchools.includes(event.ability.type)) {
      return;
    }

    this.damageGained += calculateEffectiveDamage(event, EARTHEN_SPIKE.INCREASE);
  }

  get buffedSchools() {
    return [
      MAGIC_SCHOOLS.ids.PHYSICAL,
      MAGIC_SCHOOLS.ids.NATURE,
    ];
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.EARTHEN_SPIKE_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EarthenSpike;
