import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class Tier20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  holyPowerGained = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T20_4SET_BONUS.id);
  }

  benefitsFrom4Pc(event) {
    this.spellId = event.ability.guid;
    return this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T20_4SET_BONUS.id)
      && (this.spellId === SPELLS.BLADE_OF_JUSTICE.id || this.spellId === SPELLS.DIVINE_HAMMER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (this.benefitsFrom4Pc(event)) {
      //The Tier bonus turns our 2 HP builders into 3 HP builders
      this.holyPowerGained += 1;
    }
  }

  item() {

    this.builderId = SPELLS.BLADE_OF_JUSTICE.id;
    if (this.combatants.selected.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id)) {
      this.builderId = SPELLS.DIVINE_HAMMER_TALENT.id;
    }

    return {
      id: `spell-${SPELLS.RET_PALADIN_T20_4SET_BONUS.id}`,
      icon: <SpellIcon id={this.builderId} />,
      title: <SpellLink id={SPELLS.RET_PALADIN_T20_4SET_BONUS.id} />,
      result: (
        <dfn data-tip={`Total Holy Power Gained: ${formatNumber(this.holyPowerGained)}`}>
          {formatNumber(this.holyPowerGained / this.owner.fightDuration * 60000)} Holy Power gained per minute.
        </dfn>
      ),
    };
  }
}

export default Tier20_4set;