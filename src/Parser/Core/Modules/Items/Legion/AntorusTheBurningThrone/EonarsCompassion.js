import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

const PANTHEON_MAX_SHIELD_PER_PROC = 4;

/**
 * Eonar's Compassion -
 * Equip: Your healing effects have a chance to grow an Emerald Blossom nearby, which heals a random injured ally for 127273 every 2 sec. Lasts 12 sec.
 * Eonar's Verdant Embrace - When empowered by the Pantheon, your next 4 direct healing spells grant the target a shield that prevents 250782 damage for 30 sec.
 */
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
  ];

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.EONARS_COMPASSION.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.owner.getPercentageOfTotalHealingDone(this.trinketHealing + this.pantheonShieldHealing),
      isLessThan: {
        minor: 0.04,
        average: 0.035,
        major: 0.025,
      },
      style: 'percentage',
    };
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

  // pantheon proc is a stacking buff, if it occurs while previous proc still active, will show as an applybuffstack
  // logs confirm that this will refresh current stacks to 4, still will never go above 4.
  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (this.triggerBuffs.includes(spellId)) {
      this.pantheonProc += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EONARS_COMPASSION_PROCBUFF.id) {
      this.trinketProc += 1;
    } else if (spellId === SPELLS.EONARS_COMPASSION_PANTHEONSHIELD.id) {
      this.pantheonShieldCast += 1;
    } else if (this.triggerBuffs.includes(spellId)) {
      this.pantheonProc += 1;
    }
  }

  //if the regular proc procs again while it's already active
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EONARS_COMPASSION_PROCBUFF.id) {
      this.trinketProc += 1;
    }
  }

  get totalHealing() {
    return this.trinketHealing + this.pantheonShieldHealing;
  }

  item() {
    const minutes = this.owner.fightDuration / 1000 / 60;
    const basicPpm = this.trinketProc / minutes;
    const pantheonPpm = this.pantheonProc / minutes;
    const possibleShields = this.pantheonProc * PANTHEON_MAX_SHIELD_PER_PROC;
    return {
      item: ITEMS.EONARS_COMPASSION,
      result: (
        <dfn
          data-tip={`
            Basic Procs
            <ul>
              <li>${this.owner.formatItemHealingDone(this.trinketHealing)}</li>
              <li>${this.trinketProc} procs (${basicPpm.toFixed(1)} PPM)</li>
            </ul>
            Pantheon Procs
            <ul>
              <li>${this.owner.formatItemHealingDone(this.pantheonShieldHealing)}</li>
              <li>${this.pantheonProc} procs (${pantheonPpm.toFixed(1)} PPM)</li>
              ${this.pantheonProc ? `<li>Applied ${this.pantheonShieldCast} shields (out of ${possibleShields} possible)</li>` : ``}
            </ul>
          `}
        >
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }
}

export default EonarsCompassion;
