import SPELLS from 'common/SPELLS/classic/druid';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import { RefreshInfo } from 'parser/shared/modules/HotTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotTrackerRestoDruid from 'analysis/classic/druid/restoration/modules/core/HotTrackerRestoDruid';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const debug = false;

const OVERHEAL_THRESHOLD = 0.75;

/** Tracks stuff about Rejuvenation usage */
class Rejuvenation extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    combatants: Combatants,
    hotTracker: HotTrackerRestoDruid,
  };

  protected healingDone!: HealingDone;
  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerRestoDruid;

  /** Healing stats for active hardcast rejuvenations, indexed by targetID */
  activeHardcastRejuvs: { [key: number]: HealingValue } = {};
  /** Latch to check if refresh callback has been registered with HotTracker.
   *  (we can't just do it during constructor due to load order */
  hasCallbackRegistered: boolean = false;

  /** Total casts of rejuvenation */
  totalRejuvsCasts = 0;
  /** Hardcasts of rejuvenation that clipped duration */
  earlyRefreshments = 0;
  /** Hardcasts of rejuvenation that did not clip, but did high overheal while active */
  highOverhealCasts = 0;
  /** Total duration clipped, in ms */
  timeLost = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION]),
      this.onRejuvApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION]),
      this.onRejuvRemove,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION]),
      this.onRejuvHeal,
    );
    debug && this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onRejuvApply(event: ApplyBuffEvent) {
    if (!this.hasCallbackRegistered) {
      this.hotTracker.addRefreshHook(SPELLS.REJUVENATION.id, this.onRejuvRefresh.bind(this));
      this.hasCallbackRegistered = true;
    }
    this.totalRejuvsCasts += 1;
    this.activeHardcastRejuvs[event.targetID] = HealingValue.empty();
  }

  onRejuvRefresh(event: RefreshBuffEvent | ApplyBuffStackEvent, info: RefreshInfo) {
    // close out existing active rejuv tracker
    if (this.activeHardcastRejuvs[event.targetID]) {
      this._handleFinishedRejuv(this.activeHardcastRejuvs[event.targetID]);
      delete this.activeHardcastRejuvs[event.targetID];
    }

    // hot tracker hook event could be refresh or applystack, but in this case we know it will be a refresh
    this.totalRejuvsCasts += 1;
    if (info.clipped > 0) {
      this.earlyRefreshments += 1;
      this.timeLost += info.clipped;
      debug &&
        console.log(
          `Rejuv hardcast clipped @ ${this.owner.formatTimestamp(
            event.timestamp,
          )} - remaining: ${info.oldRemaining.toFixed(0)}, clipped: ${info.clipped.toFixed(0)}`,
        );
    } else {
      // we only track hardcast rejuvs that weren't clipping old ones so we don't double count
      // early refreshes vs high overheal casts in the final tally
      this.activeHardcastRejuvs[event.targetID] = HealingValue.empty();
    }
  }

  onRejuvRemove(event: RemoveBuffEvent) {
    // close out active rejuv tracker
    if (this.activeHardcastRejuvs[event.targetID]) {
      this._handleFinishedRejuv(this.activeHardcastRejuvs[event.targetID]);
      delete this.activeHardcastRejuvs[event.targetID];
    }
  }

  onRejuvHeal(event: HealEvent) {
    if (this.activeHardcastRejuvs[event.targetID]) {
      this.activeHardcastRejuvs[event.targetID] =
        this.activeHardcastRejuvs[event.targetID].addEvent(event);
    }
  }

  _handleFinishedRejuv(val: HealingValue) {
    if (val.raw > 0) {
      const percentOverheal = val.overheal / val.raw;
      if (percentOverheal >= OVERHEAL_THRESHOLD) {
        this.highOverhealCasts += 1;
      }
    }
  }

  onFightEnd() {
    debug && console.log('Total casts: ' + this.totalRejuvsCasts);
    debug && console.log('Early refreshments: ' + this.earlyRefreshments);
    debug && console.log('High overheal: ' + this.highOverhealCasts);
    debug && console.log('Time lost: ' + this.timeLost);
  }

  get timeLostPerMinute() {
    return this.timeLost / (this.owner.fightDuration / 1000 / 60);
  }

  get timeLostInSeconds() {
    return this.timeLost / 1000;
  }

  get timeLostInSecondsPerMinute() {
    return this.timeLostPerMinute / 1000;
  }

  get earlyRefreshmentsPerMinute() {
    return this.earlyRefreshments / (this.owner.fightDuration / 1000 / 60);
  }

  get goodRejuvs() {
    return this.totalRejuvsCasts - this.earlyRefreshments - this.highOverhealCasts;
  }

  /* get avgRejuvHealing() {
    const totalRejuvHealing = this.mastery.getMultiMasteryHealing([
      SPELLS.REJUVENATION.id,
    ]);
    return totalRejuvHealing / this.totalRejuvsCasts;
  } */

  /** Guide subsection describing the proper usage of Rejuvenation */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.REJUVENATION} />
          </b>{' '}
          is your primary filler spell. It can be used on injured raiders or pre-cast on full health
          raiders when big damage is incoming. Don't spam it unmotivated - you'll run out of mana.
          Don't cast it on targets with a high duration Rejuvenation - you'll clip duration. Some
          high-overheal Rejuvs are unavoidable due to heal sniping, but if a large proportion of
          them are you might be casting too much.
        </p>
        <p>
          Rejuvenation can proc <SpellLink spell={SPELLS.REVITALIZE_MANA} />
        </p>
      </>
    );

    const goodRejuvs = {
      count: this.goodRejuvs,
      label: 'Good Rejuvenations',
    };
    const highOverhealRejuvs = {
      count: this.highOverhealCasts,
      label: 'High-overheal Rejuvenations',
    };
    const clippedRejuvs = {
      count: this.earlyRefreshments,
      label: 'Clipped duration Rejuvenations',
    };
    const data = (
      <div>
        <strong>Rejuvenation cast breakdown</strong>
        <small>
          {' '}
          - Green is a good cast, Yellow is a cast with very high overheal, and Red is an early
          refresh that clipped duration. Mouseover for more details.
        </small>
        <GradiatedPerformanceBar good={goodRejuvs} ok={highOverhealRejuvs} bad={clippedRejuvs} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(50)} // chosen for fixed ordering of general stats
        size="flexible"
        tooltip={
          <>
            You refreshed Rejuvenation early <strong>{this.earlyRefreshments} times</strong>, losing
            a total of <strong>{this.timeLostInSeconds.toFixed(1)}s</strong> of HoT duration (
            {this.timeLostInSecondsPerMinute.toFixed(1)}s per minute).
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.REJUVENATION} /> Early Rejuvenation refreshes
            </>
          }
        >
          <>
            {this.earlyRefreshmentsPerMinute.toFixed(1)} <small>per minute</small>
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Rejuvenation;
