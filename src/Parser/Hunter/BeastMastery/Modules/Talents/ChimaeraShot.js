import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class ChimaeraShot extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CHIMAERA_SHOT_FROST_DAMAGE.id || spellId !== SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    if (this.damage > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT.id}>
              <SpellIcon id={SPELLS.CHIMAERA_SHOT_TALENT.id} noLink /> Chimaera Shot
            </SpellLink>
          </div>
          <div className="flex-sub text-right">
            {(this.owner.formatItemDamageDone(this.damage))}
          </div>
        </div>
      );
    }
  }
}

export default ChimaeraShot;
