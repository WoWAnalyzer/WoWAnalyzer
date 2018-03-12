import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * When you Marked Shot, Thas'dorah has a chance to call forth a barrage of wind arrows to strike all Vulnerable targets.
 */
class CallOfTheHunter extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.CALL_OF_THE_HUNTER_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CALL_OF_THE_HUNTER_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CALL_OF_THE_HUNTER_TRAIT.id}>
            <SpellIcon id={SPELLS.CALL_OF_THE_HUNTER_TRAIT.id} noLink /> Call of the Hunter
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default CallOfTheHunter;
