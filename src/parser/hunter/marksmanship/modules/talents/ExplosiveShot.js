import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Fires a slow-moving munition directly forward.
 * Activating this ability a second time detonates the Shot, dealing up to (1000% of Attack power) Fire damage to all enemies within 8 yds, damage based on proximity.
 *
 * Example log: https://www.warcraftlogs.com/reports/Bc984AfRjXQYgxCz#fight=7&type=damage-done
 */

class ExplosiveShot extends Analyzer {

  hits = 0;
  damage = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_SHOT_TALENT.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_SHOT_DAMAGE.id) {
      return;
    }
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
            <ItemDamageDone amount={this.damage} /> <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ExplosiveShot;
