import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/druid';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent, EventType, HealEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingValue from 'parser/shared/modules/HealingValue';
import BoringValue from 'parser/ui/BoringValueText';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { getHeals } from 'analysis/classic/druid/restoration/modules/normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

/** Number of targets WG must effectively heal in order to be efficient */
const RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD = 3;
/** Max time after WG apply to watch for high overhealing */
const OVERHEAL_BUFFER = 3000;
/** Overheal percent within OVERHEAL_BUFFER of application that will count as 'too much' */
const OVERHEAL_THRESHOLD = 0.6;

/**
 * Tracks stats relating to Wild Growth
 */
class WildGrowth extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  abilityTracker!: AbilityTracker;

  recentWgTimestamp: number = 0;
  /** Tracker for the overhealing on targets hit by a recent hardcast Wild Growth, indexed by targetID */
  recentWgTargetHealing: {
    [key: number]: { appliedTimestamp: number; total: number; overheal: number };
  } = {};

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

  /** Box row entry for each WG cast */
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onCastWg);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onHealWg);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    this._tallyLastCast(); // make sure the last cast is closed out
  }

  onCastWg(event: CastEvent) {
    this._tallyLastCast(); // make sure the previous cast is closed out
    this._trackNewCast(event);
  }

  onHealWg(event: HealEvent) {
    const recentWgHealTracker = this.recentWgTargetHealing[event.targetID];
    if (recentWgHealTracker !== undefined) {
      const healVal = HealingValue.fromEvent(event);
      recentWgHealTracker.total += healVal.raw;
      recentWgHealTracker.overheal += healVal.overheal;
    }
  }

  /**
   * Follows the 'AppliedHeal' tag from the CastEvents to each of the HoTs it created,
   * and initializes a recentWgTargetHealing entry for each.
   */
  _trackNewCast(event: CastEvent) {
    this.recentWgTargetHealing = {};
    this.recentWgTimestamp = event.timestamp;
    getHeals(event).forEach(
      (applyHot: AnyEvent) =>
        (applyHot.type === EventType.ApplyBuff || applyHot.type === EventType.RefreshBuff) &&
        (this.recentWgTargetHealing[applyHot.targetID] = {
          appliedTimestamp: applyHot.timestamp,
          total: 0,
          overheal: 0,
        }),
    );
  }

  /**
   * Closes out the 'recent cast' tallies if there is one open and enough time has passed
   */
  _tallyLastCast() {
    this.totalCasts += 1;
    if (this.totalCasts === 1) {
      return; // there is no last cast
    }

    const hits = Object.values(this.recentWgTargetHealing);
    const effectiveHits = hits.filter((wg) => wg.total * OVERHEAL_THRESHOLD > wg.overheal).length;
    this.totalEffectiveHits += effectiveHits;

    let value = QualitativePerformance.Good;

    if (effectiveHits < RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD) {
      this.ineffectiveCasts += 1;
      if (hits.length - effectiveHits >= 2) {
        this.tooMuchOverhealCasts += 1;
        value = QualitativePerformance.Ok;
      }
      if (hits.length < RECOMMENDED_EFFECTIVE_TARGETS_THRESHOLD) {
        this.tooFewHitsCasts += 1;
        value = QualitativePerformance.Fail;
      }
    }

    // add cast perf entry
    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(this.recentWgTimestamp)}</strong>, Hits:{' '}
        <strong>{hits.length}</strong>, Effective: <strong>{effectiveHits}</strong>
      </>
    );
    this.castEntries.push({ value, tooltip });
  }

  get averageEffectiveHits() {
    return this.totalEffectiveHits / this.totalCasts || 0;
  }

  /** Guide subsection describing the proper usage of Wild Growth */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.WILD_GROWTH} />
          </b>{' '}
          is your best healing spell when multiple raiders are injured. It quickly heals a lot of
          damage, but has a high mana cost. Use Wild Growth over Rejuvenation if there are at least
          3 injured targets. Remember that only allies within 15 yds of the primary target can be
          hit - don't cast this on an isolated player!
        </p>
        <p>
          Wild Growth can proc <SpellLink spell={SPELLS.REVITALIZE_MANA} />
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Wild Growth casts</strong>
        <small>
          {' '}
          - Green is a good cast, Yellow hit three targets or more, but was mostly ineffective for
          healing, Red was effective on fewer than three targets. A hit is considered "ineffective"
          if over the first {(OVERHEAL_BUFFER / 1000).toFixed(0)} seconds it did more than{' '}
          {formatPercentage(OVERHEAL_THRESHOLD, 0)}% overhealing. Mouseover boxes for details.
        </small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(51)} // chosen for fixed ordering of general stats
        tooltip={
          <>
            This is the average number of effective hits per Wild Growth cast. Because its healing
            is so frontloaded, we consider a hit effective only if it does less than{' '}
            {formatPercentage(OVERHEAL_THRESHOLD, 0)}% overhealing over its first{' '}
            {(OVERHEAL_BUFFER / 1000).toFixed(0)} seconds.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.WILD_GROWTH} /> Average Effective Wild Growth Hits
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
