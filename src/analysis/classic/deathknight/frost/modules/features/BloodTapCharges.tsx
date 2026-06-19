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

const WASTE_THRESHOLD = 11; // FS at ≥11 stacks wastes charges

/**
 * Tracks wasted Blood Tap charges from Frost Strike casts at 11–12 stacks.
 *
 * Frost Strike generates 2 Blood Charges per cast (max 12). Casting at 11
 * stacks wastes 1 charge; at 12 stacks wastes 2 charges. Blood Charges should
 * be spent via Blood Tap before they reach the cap.
 *
 * Matches Python BloodTapChargeAnalyzer exactly, including reversed WCL event
 * ordering (removebuffstack sometimes fires before the Blood Tap cast).
 */
class BloodTapCharges extends Analyzer {
  private _currentCharges = 0;
  private _badFrostStrikes = 0;
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
    if (stack !== undefined) {
      this._currentCharges = stack;
    } else {
      this._currentCharges = Math.max(this._currentCharges, 2);
    }
  }

  private onChargeStack(event: ApplyBuffStackEvent) {
    this._currentCharges = event.stack;
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

  private onFrostStrike(_event: CastEvent) {
    if (this._currentCharges >= WASTE_THRESHOLD) {
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
