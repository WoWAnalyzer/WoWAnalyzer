import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';

/*
 * Flanking Strike has a 20% chance to summon the spirit of Ohn'ara to smite your foe for [ 1,000% of Attack Power ] Nature damage.
 */
class EchoesOfOhnara extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.ECHOES_OF_OHNARA_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ECHOES_OF_OHNARA_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ECHOES_OF_OHNARA_TRAIT.id}>
            <SpellIcon id={SPELLS.ECHOES_OF_OHNARA_TRAIT.id} noLink /> Echoes of Ohn'ara
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default EchoesOfOhnara;
