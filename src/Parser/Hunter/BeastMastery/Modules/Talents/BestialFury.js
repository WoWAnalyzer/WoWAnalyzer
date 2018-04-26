import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import ITEMS from "common/ITEMS/HUNTER";
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

//Calculates the actual % increase in damage from Bestial Fury
const BESTIAL_FURY_MODIFIER = (1.4 / 1.25) - 1;

const debug = false;

/**
 * Increase the damage bonus of Bestial Wrath by 15%.
 */

class BestialFury extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BESTIAL_FURY_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    debug && console.log(`player cast spell: `, spellId);
    this.bonusDmg += getDamageBonus(event, BESTIAL_FURY_MODIFIER);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    debug && console.log(`pet cast spell: `, spellId);
    this.bonusDmg += getDamageBonus(event, BESTIAL_FURY_MODIFIER);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.BESTIAL_FURY_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDmg} />
        </div>
      </div>
    );
  }
}

export default BestialFury;
