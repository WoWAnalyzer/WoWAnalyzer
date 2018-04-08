import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Main/ItemHealingDone';

class T21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  tranquilMistCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.CHIJIS_BATTLEGEAR_2_PIECE_BUFF.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.TRANQUIL_MIST.id) {
      this.tranquilMistCount += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.TRANQUIL_MIST.id) {
      this.tranquilMistCount += 1;
    }
  }

  item() {
    const tranquilMist = this.abilityTracker.getAbility(SPELLS.TRANQUIL_MIST.id);
    const healing = tranquilMist.healingEffective;
    return {
      id: `spell-${SPELLS.CHIJIS_BATTLEGEAR_2_PIECE_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.CHIJIS_BATTLEGEAR_2_PIECE_BUFF.id} />,
      title: <SpellLink id={SPELLS.CHIJIS_BATTLEGEAR_2_PIECE_BUFF.id} icon={false} />,
      result: <ItemHealingDone amount={healing} />,
    };
  }
}

export default T21_2set;
