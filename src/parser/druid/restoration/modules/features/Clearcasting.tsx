import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import BoringValue from 'parser/ui/BoringValueText';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const debug = false;
const LOW_HEALTH_HEALING_THRESHOLD = 0.3;
const MS_BUFFER = 123;
const ABUNDANCE_EXCEPTION_STACKS = 4;

class Clearcasting extends Analyzer {

  procsPerCC = 1;

  totalProcs = 0;
  expiredProcs = 0;
  overwrittenProcs = 0;
  usedProcs = 0;

  availableProcs = 0;

  nonCCRegrowths = 0;
  totalRegrowths = 0;
  lowHealthRegrowthsNoCC = 0;
  abundanceRegrowthsNoCC = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF), this.onRefreshBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF), this.onRemoveBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onHeal);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    debug && console.log(`Clearcasting applied @${this.owner.formatTimestamp(event.timestamp)} - ${this.procsPerCC} procs remaining`);
    this.totalProcs += this.procsPerCC;
    this.availableProcs = this.procsPerCC;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    debug && console.log(`Clearcasting refreshed @${this.owner.formatTimestamp(event.timestamp)} - overwriting ${this.availableProcs} procs - ${this.procsPerCC} procs remaining`);
    this.totalProcs += this.procsPerCC;
    this.overwrittenProcs += this.availableProcs;
    this.availableProcs = this.procsPerCC;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    debug && console.log(`Clearcasting expired @${this.owner.formatTimestamp(event.timestamp)} - ${this.availableProcs} procs expired`);
    if (this.availableProcs < 0) {
      this.availableProcs = 0;
    }
    this.expiredProcs += this.availableProcs;
    this.availableProcs = 0;
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
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
        this.abundanceRegrowthsNoCC += abundance.stacks >= ABUNDANCE_EXCEPTION_STACKS ? 1 : 0;
      }
    }
  }

  onHeal(event: HealEvent) {
    if (event.tick) {
      return;
    }
    const effectiveHealing = event.amount + (event.absorbed || 0);
    const hitPointsBeforeHeal = event.hitPoints - effectiveHealing;
    const healthPercentage = hitPointsBeforeHeal / event.maxHitPoints;
    //TODO: could we check if swiftmend &| nature's swiftness is on CD then suggest they were used instead of regrowth?
    if (healthPercentage < LOW_HEALTH_HEALING_THRESHOLD && !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id, event.timestamp, MS_BUFFER)) {
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
    return this.totalProcs > this.usedProcs;
  }

  get clearcastingUtilSuggestionThresholds() {
    return {
      actual: this.clearcastingUtilPercent,
      isLessThan: {
        minor: 0.90,
        average: 0.50,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get inneficientRegrowths() {
    return this.nonCCRegrowths - (this.lowHealthRegrowthsNoCC + this.abundanceRegrowthsNoCC);
  }

  get nonCCRegrowthsPerMinute() {
    return this.inneficientRegrowths / (this.owner.fightDuration / 60000);
  }

  get nonCCRegrowthsSuggestionThresholds() {
    return {
      actual: this.nonCCRegrowthsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get regrowthInnefficiencyWarning() {
    return (
      <>
        <SpellLink id={SPELLS.REGROWTH.id} /> is a very inefficient spell to cast without a <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> proc or {ABUNDANCE_EXCEPTION_STACKS} or more stacks of <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} />. It should only be cast when your target is about to die and you do not have <SpellLink id={SPELLS.SWIFTMEND.id} /> or <SpellLink id={SPELLS.NATURES_SWIFTNESS.id}/> available.
      </>
    );
  }

  suggestions(when: When) {
    when(this.clearcastingUtilSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs should be used quickly so they do not get overwritten or expire.</>)
          .icon(SPELLS.CLEARCASTING_BUFF.icon)
          .actual(t({
      id: "druid.restoration.suggestions.clearcasting.wastedProcs",
      message: `You missed ${this.wastedProcs} out of ${this.totalProcs} (${formatPercentage(1 - this.clearcastingUtilPercent, 1)}%) of your free regrowth procs`
    }))
          .recommended(`<${formatPercentage(1 - recommended, 1)}% is recommended`));
    when(this.nonCCRegrowthsSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(this.regrowthInnefficiencyWarning)
          .icon(SPELLS.REGROWTH.icon)
          .actual(t({
      id: "druid.restoration.suggestions.clearcasting.efficiency",
      message: `You cast ${this.nonCCRegrowthsPerMinute.toFixed(1)} Regrowths per minute without a Clearcasting proc.`
    }))
          .recommended(`${recommended.toFixed(1)} CPM is recommended`));
  }

  statistic() {
    return (
      <>
        <Statistic
          size="flexible"
          position={STATISTIC_ORDER.CORE(20)}
          tooltip={(
            <>
              Clearcasting procced <strong>{this.totalProcs} free Regrowths</strong>
              <ul>
                <li>Used: <strong>{this.usedProcs} {this.hadInvisibleRefresh ? '*' : ''}</strong></li>
                {this.hadInvisibleRefresh && <li>Overwritten: <strong>{this.overwrittenProcs}</strong></li>}
                <li>Expired: <strong>{this.expiredProcs}</strong></li>
              </ul>
              Using a clearcasting proc as soon as you get it should be one of your top priorities.
              Even if it overheals you still get that extra mastery stack on a target and the minor HoT.
              Spending your GCD on a free spell also helps with mana management in the long run.<br />
              {this.hadInvisibleRefresh && <em>* Mark of Clarity can sometimes 'invisibly refresh', which can make your total procs show as lower than you actually got. Basically, you invisibly overwrote some number of procs, but we aren't able to see how many.</em>}
            </>
          )}
        >
          <BoringValue label={<><SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} /> Clearcasting Util</>} >
            <>
              {formatPercentage(this.clearcastingUtilPercent, 1)} %
            </>
          </BoringValue>
        </Statistic>
        <Statistic
          size="flexible"
          position={STATISTIC_ORDER.CORE(21)}
          tooltip={(
            <>
              <strong>
                {this.nonCCRegrowths} of your {this.totalRegrowths} Regrowths were cast without a <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> or <SpellLink id={SPELLS.INNERVATE.id} />.
              </strong>
              <br />
              Of these {this.nonCCRegrowths},
              <ul>
                <li><strong>{this.lowHealthRegrowthsNoCC}</strong> were cast on targets with low health, making them necessary.</li>
                <li><strong>{this.abundanceRegrowthsNoCC}</strong> were cast with more than {ABUNDANCE_EXCEPTION_STACKS} stacks of <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} />, making them efficient.</li>
              </ul>
              this leaves {this.inneficientRegrowths} unfavorable <SpellLink id={SPELLS.REGROWTH.id} /> casts that you should aim to replace with <SpellLink id={SPELLS.REJUVENATION.id} />.
              <br />
              {this.regrowthInnefficiencyWarning}
            </>
          )}
        >
          <BoringValue label={<><SpellIcon id={SPELLS.REGROWTH.id} /> Inefficient Regrowths</>} >
            <>
              {this.inneficientRegrowths}
            </>
          </BoringValue>
        </Statistic>
      </>
    );
  }

}

export default Clearcasting;
