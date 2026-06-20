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
const CHARGE_GAIN = 2; // Each generator grants 2 Blood Charges per cast
const EVENT_JITTER_MS = 50; // Allow log jitter when correlating events

/**
 * Tracks wasted Blood Tap charges for Unholy DK.
 *
 * Unholy generates Blood Charges from Death Coil (Frost generates them from
 * Frost Strike instead, and Blood from Rune Strike — each spec only has one
 * generator). Casting Death Coil while already at or near the Blood Charge
 * cap (12 stacks) wastes charges.
 *
 * WCL can report the Blood Charge stack-increase event either before or
 * after the generator's own cast event, so detection mirrors the Frost
 * implementation: partial overflow is read directly off the gain event's
 * delta (order-independent), and full overflow (already capped, no stack
 * event fires) is detected at cast-time but only if no gain event already
 * resolved this same cast.
 */
class BloodTapCharges extends Analyzer {
  private _currentCharges = 0;
  private _badCasts = 0; // Death Coil cast that wasted at least 1 charge
  private _lastGainEventTs: number | null = null;
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_COIL_DK),
      this.onChargeGenerator,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_TAP), this.onBloodTap);
  }

  private onChargeApply(event: ApplyBuffEvent) {
    const stack = (event as ApplyBuffEvent & { stack?: number }).stack;
    const newStack = stack !== undefined ? stack : Math.max(this._currentCharges, CHARGE_GAIN);
    this._applyGain(event.timestamp, newStack);
  }

  private onChargeStack(event: ApplyBuffStackEvent) {
    this._applyGain(event.timestamp, event.stack);
  }

  // Records a Blood Charge increase and checks, from the delta alone,
  // whether it was a partial-overflow waste. Order-independent: both old
  // and new values come from this same event.
  private _applyGain(timestamp: number, newStack: number) {
    const previousCharges = this._currentCharges;
    const gained = Math.max(0, newStack - previousCharges);
    if (gained > 0 && gained < CHARGE_GAIN) {
      this._badCasts += 1;
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

  private onChargeGenerator(event: CastEvent) {
    const alreadyResolved =
      this._lastGainEventTs !== null &&
      Math.abs(event.timestamp - this._lastGainEventTs) <= EVENT_JITTER_MS;
    if (alreadyResolved) {
      return;
    }
    // No gain event will ever fire for this cast (stack is already at the
    // cap and won't change), so this is an unambiguous full waste.
    if (this._currentCharges >= MAX_CHARGES) {
      this._badCasts += 1;
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
      actual: this._badCasts,
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
        tooltip="Death Coil casts at 11 or 12 Blood Charges waste 1 or 2 charges respectively."
      >
        <BoringSpellValueText spell={SPELLS.BLOOD_TAP}>
          {this._badCasts} <small>wasted cast{this._badCasts !== 1 ? 's' : ''}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BloodTapCharges;
