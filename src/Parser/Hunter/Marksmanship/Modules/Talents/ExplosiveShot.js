import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

/*
 * Fires a slow-moving munition directly forward.
 * Activating this ability a second time detonates the Shot, dealing up to (1000% of Attack power) Fire damage to all enemies within 8 yds, damage based on proximity.
 */
class ExplosiveShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_SHOT_DETONATION.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id}>
            <SpellIcon id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} noLink /> Explosive Shot
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default ExplosiveShot;
