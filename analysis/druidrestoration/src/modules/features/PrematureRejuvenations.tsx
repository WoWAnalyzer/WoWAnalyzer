import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
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
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import { RefreshInfo } from 'parser/shared/modules/HotTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { isFromHardcast } from '../../normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from '../core/hottracking/HotTrackerRestoDruid';

const debug = true;

const OVERHEAL_THRESHOLD = 0.75;

/*
 * This module tracks early refreshments of rejuvenation.
 * TODO: Extend/refactor this module to include other HoTs/Spells as well such as lifebloom/efflorescence
 * TODO: Add this module to checklist
 * TODO: refactor to just use HotTracker rather than own logic
 */
class PrematureRejuvenations extends Analyzer {
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
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]),
      this.onRejuvApply,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]),
      this.onRejuvRemove,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]),
      this.onRejuvHeal,
    );
    debug && this.addEventListener(Events.fightend, this.onFightend);
  }

  onRejuvApply(event: ApplyBuffEvent) {
    if (!this.hasCallbackRegistered) {
      this.hotTracker.addRefreshHook(SPELLS.REJUVENATION.id, this.onRejuvRefresh.bind(this));
      this.hotTracker.addRefreshHook(
        SPELLS.REJUVENATION_GERMINATION.id,
        this.onRejuvRefresh.bind(this),
      );
      this.hasCallbackRegistered = true;
    }
    if (isFromHardcast(event)) {
      this.totalRejuvsCasts += 1;
      this.activeHardcastRejuvs[event.targetID] = new HealingValue();
    }
  }

  onRejuvRefresh(event: RefreshBuffEvent | ApplyBuffStackEvent, info: RefreshInfo) {
    // close out existing active rejuv tracker
    if (this.activeHardcastRejuvs[event.targetID]) {
      this._handleFinishedRejuv(this.activeHardcastRejuvs[event.targetID]);
      delete this.activeHardcastRejuvs[event.targetID];
    }

    // hot tracker hook event could be refresh or applystack, but in this case we know it will be a refresh
    if (isFromHardcast(event as RefreshBuffEvent)) {
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
        this.activeHardcastRejuvs[event.targetID] = new HealingValue();
      }
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
      this.activeHardcastRejuvs[event.targetID] = this.activeHardcastRejuvs[event.targetID].add(
        event.amount,
        event.absorbed,
        event.overheal,
      );
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

  onFightend() {
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

  get timeLostThreshold() {
    return {
      actual: this.timeLostInSecondsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 4,
        major: 9,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.timeLostThreshold).addSuggestion((suggest) =>
      suggest(
        <>
          Don't refresh <SpellLink id={SPELLS.REJUVENATION.id} /> if it's not within pandemic time
          frame (4.5s left on buff).
        </>,
      )
        .icon(SPELLS.REJUVENATION.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.rejuvenation.wastedSeconds',
            message: `You refreshed early ${
              this.earlyRefreshments
            } times which made you waste ${this.timeLostInSeconds.toFixed(
              2,
            )} seconds of rejuvenation.`,
          }),
        )
        .recommended(`0 seconds lost is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(18)}
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
              <SpellIcon id={SPELLS.REJUVENATION.id} /> Early Rejuvenation refreshes
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

export default PrematureRejuvenations;
