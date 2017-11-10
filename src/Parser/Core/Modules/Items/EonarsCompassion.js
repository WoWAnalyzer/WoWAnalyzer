import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';

const PANTHEON_MAX_SHIELD_PER_PROC = 4;

class EonarsCompassion extends Analyzer {
  static dependencies = {
      combatants: Combatants,
  };
  trinketHealing = 0;
  trinketProc = 0;
  pantheonShieldHealing = 0;
  pantheonProc = 0;
  pantheonShieldCast = 0;

  triggerBuffs = [
    SPELLS.EONARS_COMPASSION_PANTHEONBUFF_RDRUID.id,
    SPELLS.EONARS_COMPASSION_PANTHEONBUFF_RMONK.id,
    SPELLS.EONARS_COMPASSION_PANTHEONBUFF_HPALADIN.id,
    SPELLS.EONARS_COMPASSION_PANTHEONBUFF_DPRIEST.id,
    SPELLS.EONARS_COMPASSION_PANTHEONBUFF_HPRIEST.id,
    SPELLS.EONARS_COMPASSION_PANTHEONBUFF_RSHAMAN.id,
  ]

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.EONARS_COMPASSION.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EONARS_COMPASSION_HEAL.id) {
      this.trinketHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EONARS_COMPASSION_PANTHEONSHIELD.id) {
      this.pantheonShieldHealing += (event.amount || 0);
    }
  }

  on_byPlayer_applybuff(event) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.EONARS_COMPASSION_PROCBUFF.id) {
        this.trinketProc += 1;
      }
      else if (spellId === SPELLS.EONARS_COMPASSION_PANTHEONSHIELD.id) {
        this.pantheonShieldCast += 1;
      }
      else if (this.triggerBuffs.includes(spellId)) {
        this.pantheonProc += 1;
      }
  }

  item() {
    const totalHeal = this.trinketHealing + this.pantheonShieldHealing;
    const minutes = this.owner.fightDuration / 1000 / 60;
    const ppm = this.trinketProc / minutes;
    const trinketPercentHPS = formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.trinketHealing));
    const trinketHPS = formatNumber(this.trinketHealing / this.owner.fightDuration * 1000);
    const pantheonPpm = this.pantheonProc / minutes;
    const pantheonPercentHPS = formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.pantheonShieldHealing));
    const pantheonHPS = formatNumber(this.pantheonShieldHealing / this.owner.fightDuration * 1000);
    const possiblesShield = this.pantheonProc * PANTHEON_MAX_SHIELD_PER_PROC;
      return {
          item: ITEMS.EONARS_COMPASSION,
          result: (
            <dfn data-tip={`The trinket effect procced ${this.trinketProc} times with an average of ${ppm.toFixed(2)} PPM.<br>
            This did ${formatNumber(this.trinketHealing)} healing and was ${trinketPercentHPS}% of your total healing, provinding ${trinketHPS} HPS.<br><br>
            The pantheon effect procced ${this.pantheonProc} times with an average of ${pantheonPpm.toFixed(2)} PPM.<br>
            You casted ${this.pantheonShieldCast} shields out of the ${possiblesShield} possibles.<br>
            This did ${formatNumber(this.pantheonShieldHealing)} absorb and was ${pantheonPercentHPS}% of your total healing, provinding ${pantheonHPS} HPS.`}>
        {this.owner.formatItemHealingDone(totalHeal)}
        </dfn>),
    };
  }
}

export default EonarsCompassion;
