import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * When you use Multi-Shot, Titanstrike has a chance to discharge an electric current at your pets' locations, causing an explosion of
 * electricity that deals (Ranged attack power * 2) Nature damage to all nearby enemies.
 */
class SurgeOfTheStormgod extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.SURGE_OF_THE_STORMGOD_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SURGE_OF_THE_STORMGOD_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    if (this.damage > 0) {
      // TODO: Remove this if-statement since rendering should be consistent regardless of cast count OR document why this is an exception
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.SURGE_OF_THE_STORMGOD_TRAIT.id} />
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.damage} />
          </div>
        </div>
      );
    }
    return null;
  }
}

export default SurgeOfTheStormgod;
