import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';

/*
 * Launches Sidewinders that travel toward the target, weaving back and forth and dealing (500% of Attack power) Nature damage to each target they hit. Cannot hit the same target twice. Applies Vulnerable to all targets hit.
 * Generates 35 Focus.
 * Replaces Arcane Shot and Multi-Shot.
 */
class Sidewinders extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SIDEWINDERS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SIDEWINDERS_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SIDEWINDERS_TALENT.id}>
            <SpellIcon id={SPELLS.SIDEWINDERS_TALENT.id} noLink /> Sidewinders
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default Sidewinders;
