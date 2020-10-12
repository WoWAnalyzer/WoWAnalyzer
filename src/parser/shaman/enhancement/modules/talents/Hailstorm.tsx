import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';

/**
 * Each stack of Maelstrom Weapon consumed increases the damage of your next
 * Frost Shock by 35%, and causes your next Frost Shock to hit 1 additional
 * target per Maelstrom Weapon stack consumed.
 *
 * Example Log:
 */
class Hailstorm extends Analyzer {
  protected casts: number = 0;
  protected hits: number = 0;
  protected damage: number = 0;

  constructor(options: any) {
    super(options);

    if (!this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id)) {
      this.active = false;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.FROST_SHOCK),
      this.onFrostShockCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.FROST_SHOCK),
      this.onFrostShockDamage,
    );
  }

  onFrostShockCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.HAILSTORM_BUFF.id)) {
      return;
    }

    this.casts += 1;
  }

  onFrostShockDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HAILSTORM_BUFF.id)) {
      return;
    }

    this.hits += 1;
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.HAILSTORM_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Hailstorm;
