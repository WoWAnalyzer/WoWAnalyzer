import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

const debug = false;

class RenewingMist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  remApplyTimestamp = null;
  remRemoveTimestamp = null;
  remCastTimestamp = null;
  dancingMistProc = 0;
  remTicks = 0;
  castsREM = 0;
  remCount = 0;
  dancingMistTarget = [];
  dancingMistHeal = 0;

  on_initialize() {
    this.active = this.modules.combatants.selected.traitsBySpellId[SPELLS.DANCING_MISTS.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      // Buffer time added to account for the buff being removed and replicating to a new target.  Testing 100ms for now.
      debug && console.log(`Last Applied Timestamp: ${this.remApplyTimestamp} / Current Event Timestamp: ${event.timestamp}`);
      if ((event.timestamp - this.remRemoveTimestamp) <= 100 || this.remCastTimestamp === event.timestamp || this.remApplyTimestamp === event.timestamp) {
        debug && console.log(`REM Applied Ok. Timestamp: ${event.timestamp} Target ID: `, event.targetID);
      } else {
        debug && console.log(`REM Applied without Cast / Jump. Timestamp: ${event.timestamp}`);
        debug && console.log(`Target ID ${event.targetID}`);
        this.dancingMistProc += 1;
        this.dancingMistTarget.push(event.targetID);
        debug && console.log(`Dancing Mist Targets: ${this.dancingMistTarget}`);
      }
      this.remApplyTimestamp = event.timestamp;
      this.remCount += 1;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    this.dancingMistTarget.forEach((targetID) => {
      if (event.targetID === targetID) {
        debug && console.log(`Dancing Mist REM Removed: ${targetID} / Timestamp: ${event.timestamp}`);
        const removeValue = this.dancingMistTarget.indexOf(targetID);
        this.dancingMistTarget.splice(removeValue, 1);
        debug && console.log('Dancing Mist Targets: ', this.dancingMistTarget);
      }
    });
    if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      this.remRemoveTimestamp = event.timestamp;
      this.remCount -= 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // Thunder Focus Tea allows you to cast Renewing Mist without triggering its cooldown.
    if (spellId === SPELLS.RENEWING_MIST.id) {
      if (this.combatants.selected.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
        if (this.spellUsable.isOnCooldown(SPELLS.RENEWING_MIST.id)) {
          this.spellUsable.endCooldown(SPELLS.RENEWING_MIST.id);
        }
      }
    }

    if (spellId === SPELLS.RENEWING_MIST.id || spellId === SPELLS.LIFE_COCOON.id) {
      // Added because the buff application for REM can occur either before or after the cast.
      if (event.timestamp === this.remApplyTimestamp) {
        this.dancingMistProc -= 1;
        debug && console.log(`Dancing Mist Proc Removed / Timestamp: ${event.timestamp}`);
      }
      this.castsREM += 1;
      this.remCastTimestamp = event.timestamp;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      this.remTicks += 1;
      this.dancingMistTarget.forEach((targetID) => {
        if (event.targetID === targetID) {
          debug && console.log(`Dancing Mist Heal on: ${targetID}`);
          this.dancingMistHeal += (event.amount || 0) + (event.absorbed || 0);
        }
      });
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Dancing Mist Procs: ${this.dancingMistProc}`);
      console.log(`REM Ticks: ${this.remTicks}`);
      console.log(`REM Casts: ${this.castsREM}`);
      console.log(`REM Count Out: ${this.remCount}`);
      console.log(`Dancing Mist Healing ${this.dancingMistHeal}`);
    }
  }

  statistic() {

    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.DANCING_MISTS.id} />}
        value={`${formatNumber(this.dancingMistHeal)}`}
        label="Dancing Mist Healing"
        tooltip={`You had a total of ${(this.dancingMistProc)} procs on ${this.castsREM} REM casts.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(50);
}

export default RenewingMist;
