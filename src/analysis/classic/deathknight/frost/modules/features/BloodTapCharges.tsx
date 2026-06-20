import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const MAX_CHARGES = 12; // Blood Charge buff is capped at 12 stacks
const FS_CHARGE_GAIN = 2; // Frost Strike grants 2 Blood Charges per cast
const EVENT_JITTER_MS = 50; // Allow log jitter when correlating events

/**
 * Tracks wasted Blood Tap charges from Frost Strike casts at the Blood Charge
 * cap (12 stacks).
 *
 * Frost Strike generates 2 Blood Charges per cast (max 12). Casting while at
 * 11 stacks wastes 1 charge (only +1 gained); at 12 stacks wastes 2 charges
 * (nothing gained). Blood Charges should be spent via Blood Tap before they
 * reach the cap.
 *
 * WCL can report the Blood Charge stack-increase event for a Frost Strike
 * either before or after that Frost Strike's own cast event. To stay correct
 * regardless of ordering:
 * - Partial overflow (11 -> 12, +1 instead of +2) is detected from the delta
 *   on the stack-increase event itself, which is self-contained and immune
 *   to event ordering.
 * - Full overflow (already at 12, no stack event fires at all since nothing
 *   changes) is detected at cast-time, but only counted if no matching
 *   stack-increase event landed near this same timestamp (to avoid double
 *   counting the partial-overflow case above when ordering is reversed).
 *
 * Also handles reversed WCL ordering for Blood Tap itself: removebuffstack
 * sometimes fires before the Blood Tap cast.
 */
class BloodTapCharges extends Analyzer {
  private _currentCharges = 0;
  private _badFrostStrikes = 0;
  // Timestamp of the most recent Blood Charge gain event, used to avoid
  // double-counting a Frost Strike cast that's already been resolved via
  // the gain-event delta check below.
  private _lastGainEventTs: number | null = null;
  // Handles reversed WCL ordering: removebuffstack before Blood Tap cast.
  private _btPreSpendTs: number | null = null;
  private _btPreSpendCharges = 0;
  private _pendingBtEvent: CastEvent | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
      this.onChargeApply,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
      this.onChargeStack,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
      this.onChargeRemoveStack,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
      this.onChargeRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FROST_STRIKE),
      this.onFrostStrike,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_TAP), this.onBloodTap);
  }

  private onChargeApply(event: ApplyBuffEvent) {
    const stack = (event as ApplyBuffEvent & { stack?: number }).stack;
    const newStack = stack !== undefined ? stack : Math.max(this._currentCharges, FS_CHARGE_GAIN);
    this._applyGain(event.timestamp, newStack);
  }

  private onChargeStack(event: ApplyBuffStackEvent) {
    this._applyGain(event.timestamp, event.stack);
  }

  // Records a Blood Charge increase (always caused by Frost Strike) and
  // checks, from the delta alone, whether it was a partial-overflow waste.
  // This is order-independent: both the old and new values come from the
  // same event, so it doesn't matter whether the matching cast event has
  // been processed yet.
  private _applyGain(timestamp: number, newStack: number) {
    const previousCharges = this._currentCharges;
    const gained = Math.max(0, newStack - previousCharges);
    if (gained > 0 && gained < FS_CHARGE_GAIN) {
      this._badFrostStrikes += 1;
    }
    this._currentCharges = newStack;
    this._lastGainEventTs = timestamp;
  }

  private onChargeRemoveStack(event: RemoveBuffStackEvent) {
    this._btPreSpendTs = event.timestamp;
    this._btPreSpendCharges = this._currentCharges;
    this._currentCharges = event.stack;
    if (this._pendingBtEvent !== null) {
      (this._pendingBtEvent as CastEvent & { bloodChargesAfter?: number }).bloodChargesAfter =
        this._currentCharges;
      this._pendingBtEvent = null;
    }
  }

  private onChargeRemove(_event: RemoveBuffEvent) {
    this._btPreSpendTs = _event.timestamp;
    this._btPreSpendCharges = this._currentCharges;
    this._currentCharges = 0;
    if (this._pendingBtEvent !== null) {
      (this._pendingBtEvent as CastEvent & { bloodChargesAfter?: number }).bloodChargesAfter = 0;
      this._pendingBtEvent = null;
    }
  }

  private onFrostStrike(event: CastEvent) {
    // If a Blood Charge gain (or no-gain) event for this same cast already
    // landed near this timestamp, it's already been accounted for by
    // _applyGain — don't double count.
    const alreadyResolved =
      this._lastGainEventTs !== null &&
      Math.abs(event.timestamp - this._lastGainEventTs) <= EVENT_JITTER_MS;
    if (alreadyResolved) {
      return;
    }
    // No gain event will ever fire for this cast (stack is already at the
    // cap and won't change), so this is an unambiguous full waste.
    if (this._currentCharges >= MAX_CHARGES) {
      this._badFrostStrikes += 1;
    }
  }

  private onBloodTap(event: CastEvent) {
    const preSpendJustFired =
      this._btPreSpendTs !== null && event.timestamp - this._btPreSpendTs <= 1;
    if (!preSpendJustFired) {
      this._pendingBtEvent = event;
    } else {
      this._pendingBtEvent = null;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this._badFrostStrikes,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(50)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip="Frost Strike casts at 11 or 12 Blood Charges waste 1 or 2 charges respectively."
      >
        <BoringSpellValueText spell={SPELLS.BLOOD_TAP}>
          {this._badFrostStrikes}{' '}
          <small>wasted FS cast{this._badFrostStrikes !== 1 ? 's' : ''}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BloodTapCharges;
