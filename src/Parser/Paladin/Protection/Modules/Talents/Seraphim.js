import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatPercentage } from 'common/format';

/**
 * Consumes up to 2 SotR charges to provice 5500 Haste+Vers+Mastery+Crit for 8sec per consumed charge
*/

const SERAPHIM_STAT_BUFF = 5500;
const SERAPHIM_MAX_SOTR_CHARGES = 2;
const SERAPHIM_DURATION_PER_SOTR = 8000; //ms

class Seraphim extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  lastSeraphimCast = 0;
  seraphimCasts = [];

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SERAPHIM_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SERAPHIM_TALENT.id) {
      return;
    }
    
    if (this.spellUsable.chargesAvailable(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id) >= 2) {
      this.seraphimCasts.push(2);
      this.spellUsable.beginCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event.timestamp);
      this.spellUsable.beginCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event.timestamp);
    } else {
      this.seraphimCasts.push(1);
      this.spellUsable.beginCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event.timestamp);
    }
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.SERAPHIM_TALENT.id) / this.owner.fightDuration;
  }

  get seraphimCastsTooltip() {
    let tooltip = "<ul>";
    this.seraphimCasts.forEach((elem, index) => {
      tooltip += `<li>Cast #${ index + 1}: ${ elem * SERAPHIM_DURATION_PER_SOTR / 1000 } seconds (${ elem } SotR charge${ elem === 1 ? '' : 's' })</li>`;
    });
    tooltip += "</ul>";

    const consumedCharges = this.seraphimCasts.reduce((a, b) => { return a + b; }, 0);
    const possibleCharges = this.seraphimCasts.length * SERAPHIM_MAX_SOTR_CHARGES;

    if (consumedCharges !== possibleCharges) {
      tooltip += `You wasted ${ (possibleCharges - consumedCharges) * SERAPHIM_DURATION_PER_SOTR / 1000 } seconds of Seraphim by not casting it with two available charges of SotR.`;
    }
    
    return tooltip;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SERAPHIM_TALENT.id} />}
        value={`${ formatPercentage(this.uptime) }%`}
        label="Seraphim uptime"
        tooltip={`
          Resulting in an average stat increase of ${ (SERAPHIM_STAT_BUFF * this.uptime).toFixed(0) } Haste, Critical Strike, Mastery, and Versatility<br/>
          ${ this.seraphimCastsTooltip }
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);

}

export default Seraphim;
