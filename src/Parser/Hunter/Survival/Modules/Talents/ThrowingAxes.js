import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

class ThrowingAxes extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  bonusDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.THROWING_AXES_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THROWING_AXES_DAMAGE.id) {
      return;
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.THROWING_AXES_TALENT.id}>
            <SpellIcon id={SPELLS.THROWING_AXES_TALENT.id} noLink /> Throwing Axes
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }
}

export default ThrowingAxes;
