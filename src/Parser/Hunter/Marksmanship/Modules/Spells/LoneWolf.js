import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellLink from "common/SpellLink";
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const LONE_WOLF_MODIFIER = 0.10;

/**
 * Increases your damage by 10% when you do not have an active pet.
 */
class LoneWolf extends Analyzer {
  damage = 0;

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LONE_WOLF_BUFF.id)) {
      return;
    }
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    this.damage += getDamageBonus(event, LONE_WOLF_MODIFIER);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LONE_WOLF_BUFF.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default LoneWolf;
