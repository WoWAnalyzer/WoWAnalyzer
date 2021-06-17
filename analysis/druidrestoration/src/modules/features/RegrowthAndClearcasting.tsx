import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import CheckmarkIcon from 'interface/icons/Checkmark';
import CrossIcon from 'interface/icons/Cross';
import HealthIcon from 'interface/icons/Health';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

/** Health percent below which we consider a heal to be 'triage' */
const TRIAGE_THRESHOLD = 0.4;
/** Max time from cast to heal event to consider the events linked */
const MS_BUFFER = 100;
/** Min stacks required to consider a regrowth efficient */
const ABUNDANCE_EXCEPTION_STACKS = 4;

/**
 * Tracks stats relating to Regrowth and the Clearcasting proc
 *
 * This modules functioning relies on normalizers that ensure:
 * * Regrowth cast will always come before Clearcasting fade
 * * Regrowth cast will always come before Regrowth initial heal
 */
class RegrowthAndClearcasting extends Analyzer {
  /** total clearcasting procs */
  totalClearcasts = 0;
  /** overwritten clearcasting procs */
  overwrittenClearcasts = 0;
  /** set to 1 iff there is a clearcast active at fight end */
  endingClearcasts = 0;

  /** total regrowth hardcasts */
  totalRegrowths = 0;
  /** regrowth hardcasts made free by innervate */
  innervateRegrowths = 0;
  /** regrowth hardcasts made free by nature's swiftness */
  nsRegrowths = 0;
  /** regrowth hardcasts made free by clearcasting */
  ccRegrowths = 0;
  /** regrowth hardcasts that were cheap enough to be efficient due to abundance */
  abundanceRegrowths = 0;
  /** full price regrowth casts 'in the air' - waiting for heal event to categorize as triage or bad */
  pendingFullPriceRegrowths = 0;
  /** full price regrowth hardcasts that were on low health targets */
  triageRegrowths = 0;
  /** full price regrowth hardcasts on healthy targets */
  badRegrowths = 0;

  /** the most recent regrowth hardcast, or undefined if the last cast was 'accounted for' */
  lastRegrowthCast: CastEvent | undefined = undefined;

  hasAbundance: boolean;

  constructor(options: Options) {
    super(options);

    this.hasAbundance = this.selectedCombatant.hasTalent(SPELLS.ABUNDANCE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onApplyClearcast,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_BUFF),
      this.onRefreshClearcast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onCastRegrowth,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onHealRegrowth,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onApplyClearcast(event: ApplyBuffEvent) {
    this.totalClearcasts += 1;
  }

  onRefreshClearcast(event: RefreshBuffEvent) {
    this.totalClearcasts += 1;
    this.overwrittenClearcasts += 1;
  }

  onCastRegrowth(event: CastEvent) {
    this.lastRegrowthCast = event;
    this.totalRegrowths += 1;
    this.pendingFullPriceRegrowths = 0;
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      this.innervateRegrowths += 1;
      return;
    } else if (
      this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id, event.timestamp, MS_BUFFER)
    ) {
      this.nsRegrowths += 1;
    } else if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.ccRegrowths += 1;
    } else if (
      this.selectedCombatant.getBuffStacks(SPELLS.ABUNDANCE_BUFF.id) >= ABUNDANCE_EXCEPTION_STACKS
    ) {
      this.abundanceRegrowths += 1;
    } else {
      // whether this is a triage regrowth or bad regrowth can't be determined until the heal event
      this.pendingFullPriceRegrowths = 1;
    }
  }

  onHealRegrowth(event: HealEvent) {
    // only consider if there is a pending full price regrowth
    // and initial heal that can be tied back to a hardcast
    if (
      this.pendingFullPriceRegrowths === 0 ||
      event.tick ||
      this.lastRegrowthCast === undefined ||
      this.lastRegrowthCast.timestamp + MS_BUFFER < event.timestamp ||
      this.lastRegrowthCast.targetID !== event.targetID
    ) {
      return;
    }

    // technically the amount absorbed shouldn't be counted when calculating health before heal,
    // but because heal absorbs are important to remove we'll consider this legit triage
    const effectiveHealing = event.amount + (event.absorbed || 0);
    const hitPointsBeforeHeal = event.hitPoints - effectiveHealing;
    const healthPercentage = hitPointsBeforeHeal / event.maxHitPoints;

    if (healthPercentage < TRIAGE_THRESHOLD) {
      this.triageRegrowths += 1;
    } else {
      this.badRegrowths += 1;
    }
    this.pendingFullPriceRegrowths = 0;
    this.lastRegrowthCast = undefined;
  }

  onFightEnd() {
    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.endingClearcasts = 1;
    }
  }

  get usedClearcasts() {
    return this.ccRegrowths;
  }

  get expiredClearcasts() {
    return (
      this.totalClearcasts -
      this.overwrittenClearcasts -
      this.usedClearcasts -
      this.endingClearcasts
    );
  }

  get wastedClearcasts() {
    return this.totalClearcasts - this.usedClearcasts;
  }

  get clearcastUtilPercent() {
    // return 100% when no clearcasts to avoid suggestion
    // clearcast still active at end shouldn't be counted in util, hence the subtraction from total
    return this.totalClearcasts === 0
      ? 1
      : this.usedClearcasts / (this.totalClearcasts - this.endingClearcasts);
  }

  get badRegrowthsPerMinute() {
    return this.badRegrowths / (this.owner.fightDuration / 60000);
  }

  get freeRegrowths() {
    return this.innervateRegrowths + this.ccRegrowths + this.nsRegrowths;
  }

  get clearcastingUtilSuggestionThresholds() {
    return {
      actual: this.clearcastUtilPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.5,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get badRegrowthsSuggestionThresholds() {
    return {
      actual: this.badRegrowthsPerMinute,
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
        <SpellLink id={SPELLS.REGROWTH.id} /> is very mana inefficient and should only be cast when
        free due to <SpellLink id={SPELLS.INNERVATE.id} /> or{' '}
        <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />, cheap due to {ABUNDANCE_EXCEPTION_STACKS}+{' '}
        <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} /> stacks, or to save a low health target. When
        triaging low health targets, you should use
        <SpellLink id={SPELLS.SWIFTMEND.id} /> or <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} />{' '}
        first before resorting to Regrowth.
      </>
    );
  }

  suggestions(when: When) {
    when(this.clearcastingUtilSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Use your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> before they get overwritten or
          expire.
        </>,
      )
        .icon(SPELLS.CLEARCASTING_BUFF.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.clearcasting.wastedProcs',
            message: `You missed ${this.wastedClearcasts} out of ${
              this.totalClearcasts
            } (${formatPercentage(1 - this.clearcastUtilPercent, 0)}%) of your free regrowth procs`,
          }),
        )
        .recommended(`<${formatPercentage(1 - recommended, 1)}% is recommended`),
    );
    when(this.badRegrowthsSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(this.regrowthInnefficiencyWarning)
        .icon(SPELLS.REGROWTH.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.clearcasting.efficiency',
            message: `You cast ${this.badRegrowthsPerMinute.toFixed(1)} bad Regrowths per minute.`,
          }),
        )
        .recommended(`${recommended.toFixed(1)} CPM is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(20)}
        tooltip={
          <>
            <SpellLink id={SPELLS.REGROWTH.id} /> is very mana inefficient and should only be cast
            when free due to <SpellLink id={SPELLS.INNERVATE.id} />,{' '}
            <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} /> or{' '}
            <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />,{' '}
            {this.hasAbundance && (
              <>
                cheap due to {ABUNDANCE_EXCEPTION_STACKS}+{' '}
                <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} /> stacks,
              </>
            )}{' '}
            or to save a low health target.
            <br />
            <br />
            <strong>
              You hardcast {this.totalRegrowths} <SpellLink id={SPELLS.REGROWTH.id} />
            </strong>
            <ul>
              <li>
                <SpellIcon id={SPELLS.INNERVATE.id} />{' '}
                <SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />{' '}
                <SpellIcon id={SPELLS.NATURES_SWIFTNESS.id} /> Free Casts:{' '}
                <strong>{this.freeRegrowths}</strong>
              </li>
              {this.hasAbundance && (
                <li>
                  <SpellIcon id={SPELLS.ABUNDANCE_BUFF.id} /> Cheap Casts:{' '}
                  <strong>{this.abundanceRegrowths}</strong>
                </li>
              )}
              <li>
                <HealthIcon /> Full Price Triage ({'<'}
                {formatPercentage(TRIAGE_THRESHOLD, 0)}% HP) Casts:{' '}
                <strong>{this.triageRegrowths}</strong>
              </li>
              <li>
                <CrossIcon /> Bad Casts: <strong>{this.badRegrowths}</strong>
              </li>
            </ul>
            <br />
            <strong>
              You gained {this.totalClearcasts} <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />
            </strong>
            <ul>
              <li>
                <SpellIcon id={SPELLS.REGROWTH.id} /> Used: <strong>{this.usedClearcasts}</strong>
              </li>
              <li>
                <CrossIcon /> Overwritten: <strong>{this.overwrittenClearcasts}</strong>
              </li>
              <li>
                <UptimeIcon /> Expired: <strong>{this.expiredClearcasts}</strong>
              </li>
              {this.endingClearcasts > 0 && (
                <li>
                  Still active at fight end: <strong>{this.endingClearcasts}</strong>
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.REGROWTH}>
          <>
            {this.badRegrowths === 0 ? <CheckmarkIcon /> : <CrossIcon />}
            {'  '}
            {this.badRegrowths} <small>bad casts</small>
            <br />
            <SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />
            {'  '}
            {formatPercentage(this.clearcastUtilPercent, 1)}% <small>util</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RegrowthAndClearcasting;
