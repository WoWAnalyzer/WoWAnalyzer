import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const PILLAR_CD_MS = 60_000;
const ONSET_MS = 10_000; // conservative time before first use is possible

/**
 * Tracks Pillar of Frost usage vs. possible uses.
 *
 * Pillar of Frost has a 60s cooldown. The number of possible casts is derived
 * from fight duration. Maximising PoF uptime is one of the highest-value Frost
 * DK optimisations since it lines up with every major cooldown window.
 */
class PillarOfFrost extends Analyzer {
  private _casts = 0;
  private _firstCastTime: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PILLAR_OF_FROST),
      this.onApplyBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    if (this._firstCastTime === null) {
      this._firstCastTime = event.timestamp;
    }
    this._casts += 1;
  }

  get possibleCasts() {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    const onset =
      this._firstCastTime !== null ? this._firstCastTime - this.owner.fight.start_time : ONSET_MS;
    return Math.max(this._casts, Math.floor((fightMs - onset) / PILLAR_CD_MS) + 1);
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
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._casts} actual / ${this.possibleCasts} possible casts`}
      >
        <BoringSpellValueText spell={SPELLS.PILLAR_OF_FROST}>
          {this._casts} <small>/ {this.possibleCasts} possible</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PillarOfFrost;
