import React from 'react';
import { formatPercentage } from 'common/format';
import SCHOOLS from 'common/MAGIC_SCHOOLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

const debug = false;

const IRONFUR_BASE_DURATION = 6;
const UE_DURATION_PER_RANK = 0.5;
const GUARDIAN_OF_ELUNE_DURATION = 2;

class IronFur extends Analyzer {
  _stacksTimeline = [];
  _hitsPerStack = [];
  _ironfurDuration = IRONFUR_BASE_DURATION;

  get ironfurDuration() {
    return this._ironfurDuration;
  }

  constructor(...args) {
    super(...args);
    const ueRank = this.selectedCombatant.traitsBySpellId[SPELLS.URSOCS_ENDURANCE.id];
    this._ironfurDuration += (ueRank * UE_DURATION_PER_RANK);
  }

  // Get the latest stack change
  getMostRecentStackIndex(timestamp) {
    let i = this._stacksTimeline.length - 1;
    while (i >= 0 && this._stacksTimeline[i].timestamp > timestamp) {
      i--;
    }

    return i;
  }

  getStackCount(timestamp) {
    const index = this.getMostRecentStackIndex(timestamp);
    if (index < 0) {
      return 0;
    }

    return this._stacksTimeline[index].stackCount;
  }

  addStack(stackStart, stackEnd) {
    const index = this.getMostRecentStackIndex(stackStart);
    if (index === -1) {
      this._stacksTimeline.push({ timestamp: stackStart, stackCount: 1 });
      this._stacksTimeline.push({ timestamp: stackEnd, stackCount: 0 });
      return;
    }

    const stackCount = this._stacksTimeline[index].stackCount;
    this._stacksTimeline.splice(index + 1, 0, { timestamp: stackStart, stackCount });
    let i = index + 1;
    let finalStackCount = stackCount;

    // Account for the new stack on existing events
    // Also store the stackCount right before the end of the new stack
    while (i < this._stacksTimeline.length && this._stacksTimeline[i].timestamp < stackEnd) {
      this._stacksTimeline[i].stackCount += 1;
      finalStackCount = this._stacksTimeline[i].stackCount;
      i += 1;
    }
    this._stacksTimeline.splice(i, 0, { timestamp: stackEnd, stackCount: finalStackCount - 1 });
  }

  registerHit(stackCount) {
    if (!this._hitsPerStack[stackCount]) {
      this._hitsPerStack[stackCount] = 0;
    }

    this._hitsPerStack[stackCount] += 1;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.IRONFUR.id) {
      return;
    }

    const timestamp = event.timestamp;
    const hasGoE = this.selectedCombatant.hasBuff(SPELLS.GUARDIAN_OF_ELUNE.id, timestamp);
    const duration = (this.ironfurDuration + (hasGoE ? GUARDIAN_OF_ELUNE_DURATION : 0)) * 1000;

    this.addStack(timestamp, timestamp + duration);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    // Bear Form drops all ironfur stacks immediately
    if (SPELLS.BEAR_FORM.id === spellId) {
      const index = this.getMostRecentStackIndex(event.timestamp);
      this._stacksTimeline.length = index + 1;
      this._stacksTimeline.push({ timestamp: event.timestamp, stackCount: 0 });
    }
  }

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
      const activeIFStacks = this.getStackCount(event.timestamp);
      this.registerHit(activeIFStacks);
    }
  }

  get hitsMitigated() {
    return this._hitsPerStack.slice(1).reduce((sum, x) => sum + x, 0);
  }

  get hitsUnmitigated() {
    return this._hitsPerStack[0] || 0;
  }

  get ironfurStacksApplied() {
    return this._hitsPerStack.reduce((sum, x, i) => sum + (x * i), 0);
  }

  get totalHitsTaken() {
    return this._hitsPerStack.reduce((sum, x) => sum + x, 0);
  }

  get overallIronfurUptime() {
    // Avoid NaN display errors
    if (this.totalHitsTaken === 0) {
      return 0;
    }

    return this.ironfurStacksApplied / this.totalHitsTaken;
  }

  get percentOfHitsMitigated() {
    if (this.totalHitsTaken === 0) {
      return 0;
    }
    return this.hitsMitigated / this.totalHitsTaken;
  }

  computeIronfurUptimeArray() {
    return this._hitsPerStack.map(hits => hits / this.totalHitsTaken);
  }

  on_finished() {
    if (debug) {
      console.log(`Hits with ironfur ${this.hitsMitigated}`);
      console.log(`Hits without ironfur ${this.hitsUnmitigated}`);
      console.log('Ironfur uptimes:', this.computeIronfurUptimeArray());
    }
  }

  suggestions(when) {

    when(this.percentOfHitsMitigated).isLessThan(0.90)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You only had the <SpellLink id={SPELLS.IRONFUR.id} /> buff for {formatPercentage(actual)}% of physical damage taken. You should have the Ironfur buff up to mitigate as much physical damage as possible.</span>)
          .icon(SPELLS.IRONFUR.icon)
          .actual(`${formatPercentage(actual)}% was mitigated by Ironfur`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.10).major(recommended - 0.2);
      });
  }

  statistic() {
    const totalIronFurTime = this.selectedCombatant.getBuffUptime(SPELLS.IRONFUR.id);
    const uptimes = this.computeIronfurUptimeArray().reduce((str, uptime, stackCount) => (
      str + `<li>${stackCount} stack${stackCount !== 1 ? 's' : ''}: ${formatPercentage(uptime)}%</li>`
    ), '');

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(this.percentOfHitsMitigated)}% / ${this.overallIronfurUptime.toFixed(2)}`}
        label="Hits mitigated with Ironfur / Average Stacks"
        tooltip={`Ironfur usage breakdown:
            <ul>
                <li>You were hit <b>${this.hitsMitigated}</b> times with your Ironfur buff.</li>
                <li>You were hit <b>${this.hitsUnmitigated}</b> times <b><i>without</i></b> your Ironfur buff.</li>
            </ul>
            <b>Uptimes per stack: </b>
            <ul>
              ${uptimes}
            </ul>
            <b>${formatPercentage(this.percentOfHitsMitigated)}%</b> of physical attacks were mitigated with Ironfur, and your overall uptime was <b>${formatPercentage(totalIronFurTime / this.owner.fightDuration)}%</b>.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default IronFur;
