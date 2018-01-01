import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const LONE_WOLF_MODIFIER = 0.18;

/*
 * Increases your damage by 18%, but you can no longer use Call Pet.
 */
class LoneWolf extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.LONE_WOLF_TALENT.id);
  }

  on_byPlayer_damage(event) {
    this.damage += getDamageBonus(event, LONE_WOLF_MODIFIER);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LONE_WOLF_TALENT.id}>
            <SpellIcon id={SPELLS.LONE_WOLF_TALENT.id} noLink /> Lone Wolf
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default LoneWolf;
