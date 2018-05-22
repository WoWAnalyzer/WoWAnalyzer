import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import ITEMS from "common/ITEMS/HUNTER";

const debug = false;

/**
 * Your ranged auto attacks have a 8% chance to trigger Lock and Load, causing your next two Aimed Shots to cost no Focus and be instant.
 */

const PROC_CHANCE = 0.08;

class LockAndLoad extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  fullLNLProcs = 0;
  halfLNLProcs = 0;
  noGainLNLProcs = 0;
  totalProcs = 0;
  autoShots = 0;
  wastedInstants = 0;
  _currentStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.LOCK_AND_LOAD_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
  }

  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    this.fullLNLProcs += 1;
    this.totalProcs += 1;
    this._currentStacks = 2;
    debug && console.log('full LnL proc, this is number ', this.fullLNLProcs);

  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id, event.timestamp)) {
      return;
    }
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    this._currentStacks -= 1;
  }
  on_byPlayer_refreshbuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    if (this._currentStacks === 1) {
      this.halfLNLProcs += 1;
      this.wastedInstants += 1;
      debug && console.log('at 1 stacks already proc, this is number ', this.halfLNLProcs);

    }
    if (this._currentStacks === 2) {
      this.noGainLNLProcs += 1;
      this.wastedInstants += 2;
      debug && console.log('at 2 stacks already proc, this is number ', this.noGainLNLProcs);
    }
    this.totalProcs += 1;
    this._currentStacks = 2;
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.AUTO_SHOT.id) {
      return;
    }
    this.autoShots += 1;
  }

  get expectedProcs() {
    return this.autoShots * PROC_CHANCE;
  }

  GetZPercent(z) {
    // If z is greater than 6.5 standard deviations from the mean
    // the number of significant digits will be outside of a reasonable
    // range.
    if (z < -6.5)
      {return 0.0;}

    if (z > 6.5)
      {return 1.0;}

    let factK = 1;
    let sum = 0;
    let term = 1;
    let k = 0;
    const loopStop = Math.exp(-23);

    while (Math.abs(term) > loopStop) {
      term = 0.3989422804 * Math.pow(-1, k) * Math.pow(z, k) / (2 * k + 1) /
        Math.pow(2, k) * Math.pow(z, k + 1) / factK;
      sum += term;
      k++;
      factK *= k;
    }
    sum += 0.5;

    return sum;
  }

  binomialCalculation(procs, tries, proc_chance) {
    //Correcting for continuity we add 0.5 to procs, because we're looking for the probability of getting at most the amount of procs we received
    // if P(X <= a), then P(X<a+0.5)
    const correctedProcs = procs + 0.5;
    const nonProcChance = 1 - proc_chance;

    const stddev = Math.sqrt(proc_chance * nonProcChance * tries);
    //zScore is calculated by saying (X - M) / stddev
    const zScore = (correctedProcs - this.pn) / stddev;

    return this.GetZPercent(zScore);
  }

  //pn is the mean value of procs
  get pn() {
    return PROC_CHANCE * this.autoShots;
  }

  //qn is the mean value of non-procs
  get qn() {
    return (1 - PROC_CHANCE) * this.autoShots;
  }

  statistic() {
    const binomCalc = this.binomialCalculation(this.totalProcs, this.autoShots, PROC_CHANCE);
    let tooltipText = `You had ${this.noGainLNLProcs} ${this.noGainLNLProcs > 1 ? `procs` : `proc`} with 2 LnL stacks remaining and ${this.halfLNLProcs} ${this.halfLNLProcs > 1 ? `
  procs` : `proc`} with 1 LnL stack remaining. <br/> You had ${formatPercentage(this.totalProcs / this.expectedProcs, 1)}% procs of what you could expect to get over the encounter. <br /> You had a total of ${this.totalProcs} procs, and your expected amount of procs was ${this.expectedProcs}. <br /> <ul><li>You have a ~${formatPercentage(binomCalc)}% chance of getting this amount of procs or fewer in the future with this amount of autoattacks. </li><li>`;
    //this two first tooltipText additions will probably NEVER happen, but it'd be fun if they ever did.
    tooltipText += binomCalc === 1 ? `You had so many procs that the chance of you getting fewer procs than what you had on this attempt is going to be de facto 100%. Consider yourself the luckiest man alive.` : ``;
    tooltipText += binomCalc === 0 ? `You had so few procs that the chance of you getting fewer procs than what you had on this attempt is going to be de facto 0%. Consider yourself the unluckiest man alive.` : ``;
    tooltipText += 1 > binomCalc > 0 ? (this.pn || this.qn) > 10 ? `Due to normal approximation these results are within 2% margin of error.` : `Because you had under ${10 / PROC_CHANCE} auto attacks and due to normal approximation these results have a margin of error of over 2%.` : ``;
    tooltipText += `</li></ul>`;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LOCK_AND_LOAD_TALENT.id} />}
        value={`${this.wastedInstants} (${formatPercentage(this.wastedInstants / (this.totalProcs * 2))}%)`}
        label={`lost LnL stacks`}
        tooltip={tooltipText}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);

}

export default LockAndLoad;
