import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Fires a slow-moving munition directly forward.
 * Activating this ability a second time detonates the Shot, dealing up to (1000% of Attack power) Fire damage to all enemies within 8 yds, damage based on proximity.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Rn9XxCYLm1q7KFNW#fight=3&type=damage-done&source=15&ability=212680
 */

class ExplosiveShot extends Analyzer {

  hits = 0;
  damage = 0;
  casts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_SHOT_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_SHOT_DAMAGE), this.onDamage);
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.EXPLOSIVE_SHOT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ExplosiveShot;
