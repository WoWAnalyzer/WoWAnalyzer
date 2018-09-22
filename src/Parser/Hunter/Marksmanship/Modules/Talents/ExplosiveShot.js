import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import StatisticListBoxItem from 'Interface/Others/StatisticListBoxItem';

/**
 * Fires a slow-moving munition directly forward.
 * Activating this ability a second time detonates the Shot, dealing up to (1000% of Attack power) Fire damage to all enemies within 8 yds, damage based on proximity.
 *
 * Example log: https://www.warcraftlogs.com/reports/Bc984AfRjXQYgxCz#fight=7&type=damage-done
 */
class ExplosiveShot extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_SHOT_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default ExplosiveShot;
