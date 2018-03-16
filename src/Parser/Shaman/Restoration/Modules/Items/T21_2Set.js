import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class Restoration_Shaman_T21_2Set extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T21_2SET_BONUS_BUFF.id);
  }

  item() {
    const healing = this.abilityTracker.getAbility(SPELLS.RAINFALL.id).healingEffective;
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.RAINFALL.id);

    return {
      id: `spell-${SPELLS.RESTORATION_SHAMAN_T21_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RAINFALL.id} />,
      title: <SpellLink id={SPELLS.RESTORATION_SHAMAN_T21_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn
          data-tip={`
            Healing
            <ul>
              <li>${this.owner.formatItemHealingDone(healing)}</li>
            </ul>
            Feeding
            <ul>
              <li>${this.owner.formatItemHealingDone(feeding)}</li>
            </ul>
          `}
        >
          <ItemHealingDone amount={healing+feeding} />
        </dfn>
      ),
    };
  }
}

export default Restoration_Shaman_T21_2Set;
