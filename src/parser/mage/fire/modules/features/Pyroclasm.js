import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const BONUS_DAMAGE = 2.25;
const CAST_BUFFER = 250;

const debug = false;

class Pyroclasm extends Analyzer {

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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    this.buffUsed = false;
    this.totalProcs += 1;
    this.buffAppliedTimestamp = event.timestamp;
    debug && this.log("Buff Applied");
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    this.buffUsed = false;
    this.totalProcs += 1;
    this.buffAppliedTimestamp = event.timestamp;
    debug && this.log("Buff Applied");
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    this.buffUsed = false;
    this.wastedProcs += 1;
    this.totalProcs += 1;
    debug && this.log("Buff Refreshed");
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    debug && this.log("Buff Removed");
    if (this.buffUsed === false) {
      this.wastedProcs += 1;
      debug && this.log("Buff Expired");
    } else {
      this.usedProcs += 1;
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROCLASM_BUFF.id) {
      return;
    }
    debug && this.log("Buff Removed");
    if (this.buffUsed === false) {
      this.wastedProcs += 1;
      debug && this.log("Buff Expired");
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

    debug && this.log("Pyroblast Begin Cast");
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id || this.beginCastFound === false) {
      return;
    }
    this.beginCastFound = false;
    debug && this.log("Pyroblast Casted");
    this.castTimestamp = event.timestamp;
    const castTime = this.castTimestamp - this.beginCastTimestamp;
    //Checks the begincast and cast timestamps to determine if it is instant cast or not. This doesnt matter for ABT and ToS because hot streak pyroblasts dont have a begincast, but in Nighthold they do. So this needs to remain for backwards compatibility
    if (castTime >= CAST_BUFFER && this.selectedCombatant.hasBuff(SPELLS.PYROCLASM_BUFF.id)) {
      this.isBuffed = true;
      this.buffUsed = true;
      debug && this.log("Buff Used");
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id) {
      return;
    }
      if (this.isBuffed === true) {
        this.damage += calculateEffectiveDamage(event, BONUS_DAMAGE);
        this.isBuffed = false;
        debug && this.log("Pyroblast Damage");
      } else {
        debug && this.log("Non Buffed Pyroblast Damage");
      }
  }

  on_finished() {
    if (this.selectedCombatant.hasBuff(SPELLS.PYROCLASM_BUFF.id)) {
      const adjustedFightEnding = this.owner.currentTimestamp - 7500;
      if (this.buffAppliedTimestamp < adjustedFightEnding) {
        this.wastedProcs += 1;
        debug && this.log("Fight Ended with Unused Proc");
      } else {
        this.totalProcs -= 1;
      }
    }
    debug && this.log("Total Procs: " + this.totalProcs);
    debug && this.log("Used Procs: " + this.usedProcs);
    debug && this.log("Wasted Procs: " + this.wastedProcs);
  }

  get avgBonusDamage() {
    return this.damage / this.usedProcs;
  }

  get procsPerMinute() {
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
        return suggest(<>You wasted {formatNumber(this.wastedProcs)} of your <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> procs. These procs make your hard cast <SpellLink id={SPELLS.PYROBLAST.id} /> casts deal triple damage, so try and use them as quickly as possible to avoid losing over overwriting the procs.</>)
          .icon(SPELLS.PYROCLASM_TALENT.icon)
          .actual(`${formatPercentage(this.procUtilization)}% Utilization`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(100)}
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
}

export default Pyroclasm;
