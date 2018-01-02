import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';

/*
 * Aimed Shot has a chance to coalesce 6 extra Wind Arrows that also shoot your target.
 */
class LegacyOfTheWindrunners extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.LEGACY_OF_THE_WINDRUNNERS_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEGACY_OF_THE_WINDRUNNERS_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LEGACY_OF_THE_WINDRUNNERS_TRAIT.id}>
            <SpellIcon id={SPELLS.LEGACY_OF_THE_WINDRUNNERS_TRAIT.id} noLink /> Legacy
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default LegacyOfTheWindrunners;
