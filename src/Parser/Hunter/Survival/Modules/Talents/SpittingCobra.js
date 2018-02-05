import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatNumber } from 'common/format';

class SpittingCobra extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  bonusDamage = 0;
  cobraCasts = 0;
  focusGain = 0;
  focusWaste = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPITTING_COBRA_TALENT.id || !event.prepull) {
      return;
    }
    //starts the cooldown to ensure proper cast efficiency statistics
    this.spellUsable.beginCooldown(SPELLS.SPITTING_COBRA_TALENT.id);
    //adds one to cobraCasts so we can calculate the average casts properly
    this.cobraCasts++;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPITTING_COBRA_TALENT.id) {
      return;
    }
    this.cobraCasts++;
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPITTING_COBRA_TALENT.id) {
      return;
    }
    this.focusGain += event.resourceChange - event.waste;
    this.focusWaste += event.waste;
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPITTING_COBRA_DAMAGE.id) {
      return;
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPITTING_COBRA_TALENT.id} />}
        value={`${formatNumber(this.bonusDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Spitting Cobra"
        tooltip={`Spitting Cobra breakdown:
          <ul>
          <li>Focus gain per minute: ${formatNumber(this.focusGain / this.owner.fightDuration * 60000)}</li><ul>
                   <li>In total you gained ${this.focusGain} focus.</li>
                   <li>In total you wasted ${this.focusWaste} focus.</li>
</ul>
            <li> Average damage per cast: ${formatNumber(this.bonusDamage / this.cobraCasts)}</li>
          </ul> `} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default SpittingCobra;
