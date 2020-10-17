import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;
const LOW_HEALTH_HEALING_THRESHOLD = 0.3;
const MS_BUFFER = 123;
const ABUNDANCE_EXCEPTION_STACKS = 4;

class Clearcasting extends Analyzer {

  procsPerCC;

  totalProcs = 0;
  expiredProcs = 0;
  overwrittenProcs = 0;
  usedProcs = 0;

  availableProcs = 0;

  nonCCRegrowths = 0;
  totalRegrowths = 0;
  lowHealthRegrowthsNoCC = 0;
  abundanceRegrowthsNoCC = 0;

  constructor(...args) {
    super(...args);
    this.procsPerCC = 1;
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF), this.onRefreshBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF), this.onRemoveBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onHeal);
  }

  onApplyBuff(event) {
    debug && console.log(`Clearcasting applied @${this.owner.formatTimestamp(event.timestamp)} - ${this.procsPerCC} procs remaining`);
    this.totalProcs += this.procsPerCC;
    this.availableProcs = this.procsPerCC;
  }

  onRefreshBuff(event) {
    debug && console.log(`Clearcasting refreshed @${this.owner.formatTimestamp(event.timestamp)} - overwriting ${this.availableProcs} procs - ${this.procsPerCC} procs remaining`);
    this.totalProcs += this.procsPerCC;
    this.overwrittenProcs += this.availableProcs;
    this.availableProcs = this.procsPerCC;
  }

  onRemoveBuff(event) {
    debug && console.log(`Clearcasting expired @${this.owner.formatTimestamp(event.timestamp)} - ${this.availableProcs} procs expired`);
    if (this.availableProcs < 0) {
      this.availableProcs = 0;
    }
    this.expiredProcs += this.availableProcs;
    this.availableProcs = 0;
  }

  onCast(event) {
    if(this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }

    this.totalRegrowths += 1;

    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.availableProcs -= 1;
      this.usedProcs += 1;
      debug && console.log(`Regrowth w/CC cast @${this.owner.formatTimestamp(event.timestamp)} - ${this.availableProcs} procs remaining`);
    } else {
      this.nonCCRegrowths += 1;
      const abundance = this.selectedCombatant.getBuff(SPELLS.ABUNDANCE_BUFF.id);
      if (abundance) {
        this.abundanceRegrowthsNoCC += abundance.stacks >= ABUNDANCE_EXCEPTION_STACKS;
      }
    }
  }

  onHeal(event) {
    if (event.tick) {
      return;
    }
    const effectiveHealing = event.amount + (event.absorbed || 0);
    const hitPointsBeforeHeal = event.hitPoints - effectiveHealing;
    const healthPercentage = hitPointsBeforeHeal / event.maxHitPoints;
    if(healthPercentage<LOW_HEALTH_HEALING_THRESHOLD && !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id, event.timestamp, MS_BUFFER)) {
      this.lowHealthRegrowthsNoCC += 1;
    }
  }

  get wastedProcs() {
    return this.expiredProcs + this.overwrittenProcs;
  }

  get clearcastingUtilPercent() {
    const util = this.usedProcs / this.totalProcs;
    return (util > 1) ? 1 : util;
  }

  get hadInvisibleRefresh() {
    return this.usedProcs > this.totalProcs;
  }

  get clearcastingUtilSuggestionThresholds() {
    return {
      actual: this.clearcastingUtilPercent,
      isLessThan: {
        minor: 0.90,
        average: 0.50,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  get nonCCRegrowthsPerMinute() {
    return (this.nonCCRegrowths - (this.lowHealthRegrowthsNoCC + this.abundanceRegrowthsNoCC)) / (this.owner.fightDuration / 60000);
  }

  get nonCCRegrowthsSuggestionThresholds() {
    return {
      actual: this.nonCCRegrowthsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.clearcastingUtilSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs should be used quickly so they do not get overwritten or expire.</>)
          .icon(SPELLS.CLEARCASTING_BUFF.icon)
          .actual(i18n._(t('druid.restoration.suggestions.clearcasting.wastedProcs')`You missed ${this.wastedProcs} out of ${this.totalProcs} (${formatPercentage(1 - this.clearcastingUtilPercent, 1)}%) of your free regrowth procs`))
          .recommended(`<${Math.round(formatPercentage(1 - recommended, 1))}% is recommended`));
    when(this.nonCCRegrowthsSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<><SpellLink id={SPELLS.REGROWTH.id} /> is a very inefficient spell to cast without a <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> proc. It should only be cast when your target is about to die and you do not have <SpellLink id={SPELLS.SWIFTMEND.id} /> available.</>)
          .icon(SPELLS.REGROWTH.icon)
          .actual(i18n._(t('druid.restoration.suggestions.clearcasting.efficiency')`You cast ${this.nonCCRegrowthsPerMinute.toFixed(1)} Regrowths per minute without a Clearcasting proc.`))
          .recommended(`${recommended.toFixed(1)} CPM is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />}
        value={`${formatPercentage(this.clearcastingUtilPercent, 1)} %`}
        label="Clearcasting Util"
        tooltip={(
          <>
            Clearcasting procced <strong>{this.totalProcs} free Regrowths</strong>
            <ul>
              <li>Used: <strong>{this.usedProcs} {this.hadInvisibleRefresh ? '*' : ''}</strong></li>
              {this.hadInvisibleRefresh && <li>Overwritten: <strong>{this.overwrittenProcs}</strong></li>}
              <li>Expired: <strong>{this.expiredProcs}</strong></li>
            </ul>
            <strong>{this.nonCCRegrowths} of your Regrowths were cast without a Clearcasting proc.</strong>
            <strong>{this.lowHealthRegrowthsNoCC}</strong> of these were cast on targets with low health and
            <strong>{this.abundanceRegrowthsNoCC}</strong> of these were cast with more than {ABUNDANCE_EXCEPTION_STACKS} stacks of abundance, so they have been disregarded as bad Regrowth(s).
            Using a clearcasting proc as soon as you get it should be one of your top priorities.
            Even if it overheals you still get that extra mastery stack on a target and the minor HoT.
            Spending your GCD on a free spell also helps with mana management in the long run.<br />
            {this.hadInvisibleRefresh && <em>* Mark of Clarity can sometimes 'invisibly refresh', which can make your total procs show as lower than you actually got. Basically, you invisibly overwrote some number of procs, but we aren't able to see how many.</em>}
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Clearcasting;
