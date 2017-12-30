import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import ItemHealingDone from 'Main/ItemHealingDone';

class T21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  boltCount = 0;
  averageBoltsPerCast = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const renewingMist = this.abilityTracker.getAbility(SPELLS.RENEWING_MIST.id);

    if(spellId !== SPELLS.CHI_BOLT.id) {
      return;
    }

    this.boltCount += 1;
    this.averageBoltsPerCast = this.boltCount / renewingMist.casts;
  }

  item() {
    const chiBolt = this.abilityTracker.getAbility(SPELLS.CHI_BOLT.id);
    const healing = chiBolt.healingEffective;
    return {
      id: `spell-${SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      title: <SpellLink id={SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      result: (
        <dfn data-tip={`Average bolts per trigger: ${this.averageBoltsPerCast.toFixed(2)}`}>
          <ItemHealingDone amount={healing} />
        </dfn>
      ),
    };
  }
}

export default T21_4set;
