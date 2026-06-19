import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const PLAGUE_LEECH_CD_MS = 25_000;
const ONSET_MS = 10_000; // generous time for diseases to be applied at the start

/**
 * Tracks Plague Leech usage vs. possible uses.
 *
 * Plague Leech (25s CD) consumes both diseases to activate up to 2 depleted
 * runes as Death runes, then diseases must be immediately reapplied. Used
 * correctly it nets 2 "free" Death runes every 25s — one of the highest rune
 * generation tools available to Frost DK.
 */
class PlagueLeech extends Analyzer {
  private _casts = 0;
  private _firstCastTime: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PLAGUE_LEECH), this.onCast);
  }

  private onCast(event: CastEvent) {
    if (this._firstCastTime === null) {
      this._firstCastTime = event.timestamp;
    }
    this._casts += 1;
  }

  get possibleCasts() {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    const onset =
      this._firstCastTime !== null ? this._firstCastTime - this.owner.fight.start_time : ONSET_MS;
    return Math.max(this._casts, Math.floor((fightMs - onset) / PLAGUE_LEECH_CD_MS));
  }

  get castEfficiency() {
    return this.possibleCasts > 0 ? this._casts / this.possibleCasts : 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.castEfficiency,
      isLessThan: {
        minor: 1.0,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._casts} actual / ${this.possibleCasts} possible casts`}
      >
        <BoringSpellValueText spell={SPELLS.PLAGUE_LEECH}>
          {this._casts} <small>/ {this.possibleCasts} possible</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueLeech;
