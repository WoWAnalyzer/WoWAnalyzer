import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

class Caltrops extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  bonusDamage = 0;
  caltropsCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CALTROPS_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CALTROPS_TALENT.id) {
      return;
    }
    this.caltropsCasts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CALTROPS_DAMAGE.id) {
      return;
    }
    if (this.caltropsCasts === 0) {
      this.caltropsCasts++;
      this.spellUsable.beginCooldown(SPELLS.CALTROPS_TALENT.id);
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CALTROPS_TALENT.id}>
            <SpellIcon id={SPELLS.CALTROPS_TALENT.id} noLink /> Caltrops
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }
}

export default Caltrops;
