import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Obliterate casts made while a Rime (Freezing Fog) proc is active.
 * When Rime is up, Howling Blast is free — casting Obliterate instead wastes
 * a free HB and burns a rune unnecessarily.
 *
 * Grace window: if Rime applied within 100ms before the Obliterate cast, the
 * Obliterate itself generated the proc (WCL can log the buff before the cast),
 * so the player had no chance to react — not counted as a mistake.
 *
 * Matches Python ObliterateWithRimeAnalyzer.
 */

const RIME_PROC_GRACE_MS = 100;

class ObliterateWithRime extends Analyzer {
  private _rimeActive = false;
  private _rimeApplyTimes: number[] = [];
  private _bad = 0;
  private _total = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRimeApply,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRimeRefresh,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRimeRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OBLITERATE),
      this.onObliterate,
    );
  }

  private onRimeApply(event: ApplyBuffEvent) {
    this._rimeActive = true;
    this._rimeApplyTimes.push(event.timestamp);
  }

  private onRimeRefresh(event: RefreshBuffEvent) {
    this._rimeApplyTimes.push(event.timestamp);
  }

  private onRimeRemove(_event: RemoveBuffEvent) {
    this._rimeActive = false;
  }

  private onObliterate(event: CastEvent) {
    this._total += 1;
    if (!this._rimeActive) {
      return;
    }
    // Grace window: Rime appeared within 100ms before this cast means
    // the Obliterate itself generated the proc.
    const causedByThisOblit = this._rimeApplyTimes.some(
      (t) => event.timestamp - t >= 0 && event.timestamp - t <= RIME_PROC_GRACE_MS,
    );
    if (!causedByThisOblit) {
      this._bad += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this._bad,
      isGreaterThan: { minor: 0, average: 2, major: 5 },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(47)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._bad} of ${this._total} Obliterates were cast while Rime (Freezing Fog) was active, wasting a free Howling Blast.`}
      >
        <BoringSpellValueText spell={SPELLS.FREEZING_FOG}>
          {this._bad} <small>wasted Rime proc{this._bad !== 1 ? 's' : ''}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ObliterateWithRime;
