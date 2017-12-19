import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from 'common/SpellLink';

/*
 * Aimed Shot, Arcane Shot, Marked Shot, and Multi-Shot have 20% increased critical strike chance against targets above 80% Health, and those critical strikes deal an additional 30% damage over 8 sec.
 */
class CarefulAim extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CAREFUL_AIM_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CAREFUL_AIM_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CAREFUL_AIM_TALENT.id}>
            <SpellIcon id={SPELLS.CAREFUL_AIM_TALENT.id} noLink /> Careful Aim DoT
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {(this.owner.formatItemDamageDone(this.damage))}
        </div>
      </div>
    );
  }
}

export default CarefulAim;
