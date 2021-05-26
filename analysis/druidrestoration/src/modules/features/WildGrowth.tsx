import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, ApplyBuffEvent, CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingValue from 'parser/shared/modules/HealingValue';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

/** Number of targets WG must effectively heal in order to be efficient */
const RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD = 3;
/** Max buffer in ms from WG cast to WG apply */
const APPLY_BUFFER = 100;
/** Max time after WG apply to watch for high overhealing */
const OVERHEAL_BUFFER = 3000;
/** Overheal percent within OVERHEAL_BUFFER of application that will count as 'too much' */
const OVERHEAL_THRESHOLD = 0.5;

class WildGrowth extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  abilityTracker!: AbilityTracker;

  /** Timestamp of the most recent Wild Growth cast, or undefined if it's too long ago */
  recentWgCastTimestamp: number | undefined;
  /** Tracker for the overhealing on targets hit by a recent hardcast Wild Growth, indexed by targetID */
  recentWgTargetHealing: { [key: number]: { total: number; overheal: number } } = {};

  /** Total Wild Growth hardcasts (not tallied until the rest of the fields) */
  totalCasts = 0;
  /** Total Wild Growth HoTs applied by hardcasts */
  totalHardcastHits = 0;
  /** Total Wild Growth HoTs applied by hardcasts that didn't overheal too much early */
  totalEffectiveHits = 0;
  /** Wild Growth hardcasts that were 'ineffective' */
  ineffectiveCasts = 0;
  /** Wild Growth hardcasts that hit too many total targets (effective or not) */
  tooFewHitsCasts = 0;
  /** Wild Growth hardcasts that had too much early overhealing */
  tooMuchOverhealCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onCastWg);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyBuffWg,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onHealWg);
  }

  onCastWg(event: CastEvent) {
    this._tallyRecentCast(event); // make sure the previous cast is closed out
    this.recentWgCastTimestamp = event.timestamp; // spin up a new one
  }

  onApplyBuffWg(event: ApplyBuffEvent) {
    if (
      this.recentWgCastTimestamp !== undefined &&
      this.recentWgCastTimestamp + APPLY_BUFFER >= event.timestamp
    ) {
      this.recentWgTargetHealing[event.targetID] = { total: 0, overheal: 0 };
    }
  }

  onHealWg(event: HealEvent) {
    const recentWgHealTracker = this.recentWgTargetHealing[event.targetID];
    if (recentWgHealTracker !== undefined) {
      const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
      recentWgHealTracker.total += healVal.raw;
      recentWgHealTracker.overheal += healVal.overheal;
    }
  }

  /**
   * Closes out the 'recent cast' tallies if there is one open and enough time has passed
   */
  _tallyRecentCast(event: AnyEvent) {
    if (
      this.recentWgCastTimestamp !== undefined &&
      this.recentWgCastTimestamp + OVERHEAL_BUFFER < event.timestamp
    ) {
      this.totalCasts += 1;
      const hits = Object.values(this.recentWgTargetHealing);
      const effectiveHits = hits.filter((wg) => wg.total * OVERHEAL_THRESHOLD > wg.overheal).length;
      this.totalEffectiveHits += effectiveHits;

      if (effectiveHits < RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD) {
        this.ineffectiveCasts += 1;
        if (hits.length - effectiveHits >= 2) {
          this.tooMuchOverhealCasts += 1;
        }
        if (hits.length < RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD) {
          this.tooFewHitsCasts += 1;
        }
      }

      this.recentWgCastTimestamp = undefined;
      this.recentWgTargetHealing = {};
    }
  }

  get averageEffectiveHits() {
    return this.totalEffectiveHits / this.totalCasts || 0;
  }

  // different from totalCasts because this doesn't consider tallying - used only for ratio vs rejuv
  get actualWgCasts() {
    return this.abilityTracker.getAbility(SPELLS.WILD_GROWTH.id).casts || 0;
  }

  get actualRejuvCasts() {
    return this.abilityTracker.getAbility(SPELLS.REJUVENATION.id).casts || 0;
  }

  get wgsPerRejuv() {
    return this.actualWgCasts / this.actualRejuvCasts || 0;
  }

  get percentIneffectiveCasts() {
    return this.ineffectiveCasts / this.totalCasts || 0;
  }

  get percentTooFewTargetCasts() {
    return this.tooFewHitsCasts / this.totalCasts || 0;
  }

  get percentTooMuchOverhealCasts() {
    return this.tooMuchOverhealCasts / this.totalCasts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.wgsPerRejuv,
      isLessThan: {
        minor: 0.12,
        average: 0.08,
        major: 0.03,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionPercentIneffectiveCastsThresholds() {
    return {
      actual: this.percentIneffectiveCasts,
      isGreaterThan: {
        minor: 0.0,
        average: 0.15,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionPercentIneffectiveCastsThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You sometimes hit too few injured targets with your{' '}
          <SpellLink id={SPELLS.WILD_GROWTH.id} /> casts. Wild Growth is not mana efficient when
          hitting few targets, you should only cast it when you can hit at least{' '}
          {RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD} wounded targets. Make sure you are not casting
          on a primary target isolated from the raid, as it can only hit targets within 30 yds of
          the primary. Make sure you are not pre-casting on targets before they are hurt, as Wild
          Growth is a brief HoT and most of its healing is frontloaded.
        </>,
      )
        .icon(SPELLS.WILD_GROWTH.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.wildgrowth.tooFewTargets',
            message: `${formatPercentage(
              this.percentIneffectiveCasts,
              0,
            )}% of your casts were effective on fewer than ${RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD} targets.`,
          }),
        )
        .recommended(
          `never casting on fewer than ${RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD} wounded targets is recommended`,
        ),
    );
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.WILD_GROWTH.id} /> to rejuv ratio can be improved, try to cast
          more wild growths if possible as it is usually more efficient.
        </>,
      )
        .icon(SPELLS.WILD_GROWTH.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.wildgrowth.rejuvenationRatio',
            message: `${this.actualWgCasts} WGs / ${this.actualRejuvCasts} rejuvs`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(19)}
        tooltip={
          <>
            This is the average number of effective hits per Wild Growth cast. Because its healing
            is so frontloaded, we consider a hit effective only if it does less than{' '}
            {formatPercentage(OVERHEAL_THRESHOLD, 0)}% overhealing over its first{' '}
            {(OVERHEAL_BUFFER / 1000).toFixed(0)} seconds.
            <br /> <br />
            This statistic only considers hardcasts, Wild Growths procced by Convoke the Spirits are
            ignored.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon id={SPELLS.WILD_GROWTH.id} /> Average Effective Wild Growth Hits
            </>
          }
        >
          <>{this.averageEffectiveHits.toFixed(1)}</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default WildGrowth;
