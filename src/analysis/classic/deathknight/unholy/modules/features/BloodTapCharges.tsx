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

const WASTE_THRESHOLD = 11;

/**
 * Tracks wasted Blood Tap charges for Unholy DK.
 *
 * Unlike Frost, Unholy generates charges from both Frost Strike AND Death
 * Coil (and rarely Rune Strike). Casting any of these at 11-12 stacks
 * wastes charges. Matches Python UnholyBloodTapChargeAnalyzer.
 */
class BloodTapCharges extends Analyzer {
  private _currentCharges = 0;
  private _badCasts = 0; // FS or DC cast at ≥11 charges
  private _btPreSpendTs: number | null = null;
  private _btPreSpendCharges = 0;
  private _pendingBtEvent: CastEvent | null = null;

  private static CHARGE_GENERATORS = [
    SPELLS.FROST_STRIKE,
    SPELLS.DEATH_COIL_DK,
    SPELLS.RUNE_STRIKE,
  ];

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
      Events.cast.by(SELECTED_PLAYER).spell(BloodTapCharges.CHARGE_GENERATORS),
      this.onChargeGenerator,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_TAP), this.onBloodTap);
  }

  private onChargeApply(event: ApplyBuffEvent) {
    const stack = (event as ApplyBuffEvent & { stack?: number }).stack;
    this._currentCharges = stack !== undefined ? stack : Math.max(this._currentCharges, 2);
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

  private onChargeGenerator(_event: CastEvent) {
    if (this._currentCharges >= WASTE_THRESHOLD) {
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
        tooltip="Frost Strike or Death Coil casts at 11 or 12 Blood Charges waste 1 or 2 charges."
      >
        <BoringSpellValueText spell={SPELLS.BLOOD_TAP}>
          {this._badCasts} <small>wasted cast{this._badCasts !== 1 ? 's' : ''}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BloodTapCharges;
