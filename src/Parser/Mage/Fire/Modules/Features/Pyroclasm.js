import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const BONUS_DAMAGE = 3;
const CAST_BUFFER = 250;

const debug = false;

class Pyroclasm extends Analyzer {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;
  beginCastTimestamp = 0;
  castTimestamp = 0;
  buffUsed = false;
  isBuffed = false;
  beginCastFound = false;
  count = 0;
  wastedProcs = 0;
  usedProcs = 0;
  totalProcs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PYROCLASM_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    this.buffUsed = false;
    this.totalProcs += 1;
    this.buffAppliedTimestamp = event.timestamp;
    debug && console.log("Buff Applied @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    this.buffUsed = false;
    this.totalProcs += 1;
    this.buffAppliedTimestamp = event.timestamp;
    debug && console.log("Buff Applied @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    this.buffUsed = false;
    this.wastedProcs += 1;
    this.totalProcs += 1;
    debug && console.log("Buff Refreshed " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    debug && console.log("Buff Removed @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    if (this.buffUsed === false) {
      this.wastedProcs += 1;
      debug && console.log("Buff Expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else {
      this.usedProcs += 1;
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    debug && console.log("Buff Removed @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    if (this.buffUsed === false) {
      this.wastedProcs += 1;
      debug && console.log("Buff Expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else {
      this.usedProcs += 1;
    }
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id) {
      return;
    }
    this.beginCastTimestamp = event.timestamp;
    this.beginCastFound = true;

    debug && console.log("Pyroblast Begin Cast @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id || this.beginCastFound === false) {
      return;
    }
    this.beginCastFound = false;
    debug && console.log("Pyroblast Casted @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    this.castTimestamp = event.timestamp;
    const castTime = this.castTimestamp - this.beginCastTimestamp;
    //Checks the begincast and cast timestamps to determine if it is instant cast or not. This doesnt matter for ABT and ToS because hot streak pyroblasts dont have a begincast, but in Nighthold they do. So this needs to remain for backwards compatibility
    if (castTime >= CAST_BUFFER && this.combatants.selected.hasBuff(SPELLS.PYROCLASM_BUFF.id)) {
      this.isBuffed = true;
      this.buffUsed = true;
      debug && console.log("Buff Used @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id) {
      return;
    }
      if (this.isBuffed === true) {
        this.damage += getDamageBonus(event, BONUS_DAMAGE);
        this.isBuffed = false;
        debug && console.log("Pyroblast Damage @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      } else {
        debug && console.log("Non Buffed Pyroblast Damage @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
  }

  on_finished() {
    if (this.combatants.selected.hasBuff(SPELLS.PYROCLASM_BUFF.id)) {
      const adjustedFightEnding = this.owner.currentTimestamp - 7500;
      if (this.buffAppliedTimestamp < adjustedFightEnding) {
        this.wastedProcs += 1;
        debug && console.log("Fight Ended with Unused Proc @ " + formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time));
      } else {
        this.totalProcs -= 1;
      }
    }
    debug && console.log("Total Procs: " + this.totalProcs);
    debug && console.log("Used Procs: " + this.usedProcs);
    debug && console.log("Wasted Procs: " + this.wastedProcs);
  }

  get avgBonusDamage() {
    return this.damage / this.usedProcs;
  }

  get procsPerMinute() {
    console.log(this.owner.fightDuration / 60000);
    return this.totalProcs / (this.owner.fightDuration / 60000);
  }

  get procUtilization() {
    return 1 - (this.wastedProcs / this.totalProcs);
  }

  get procUtilizationThresholds() {
    return {
      actual: this.procUtilization,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.procUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You wasted {formatNumber(this.wastedProcs)} of your <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> procs. Try to use your procs as soon as possible to avoid this.</React.Fragment>)
          .icon(SPELLS.PYROCLASM_TALENT.icon)
          .actual(`${formatPercentage(this.procUtilization)}% Utilization`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PYROCLASM_TALENT.id} />}
        value={`${formatPercentage(this.procUtilization, 0)} %`}
        label="Pyroclasm Utilization"
        tooltip={`This is a measure of how well you utilized your Pyroclasm Procs.
        <ul>
          <li>${this.procsPerMinute.toFixed(2)} Procs Per Minute</li>
          <li>${formatNumber(this.usedProcs)} Procs Used</li>
          <li>${formatNumber(this.wastedProcs)} Procs Wasted</li>
        </ul>
      `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default Pyroclasm;
