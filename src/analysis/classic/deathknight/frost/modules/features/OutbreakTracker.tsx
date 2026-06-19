import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const OUTBREAK_CD_MS = 60_000;
const ONSET_MS = 10_000;

/**
 * Tracks Outbreak cast efficiency for Frost DK.
 * Outbreak (60s CD) applies both diseases instantly, saving GCDs spent on
 * Icy Touch + Plague Strike. It should be used on cooldown.
 * Matches Python OutbreakAnalyzer.
 */
class OutbreakTracker extends Analyzer {
  private _casts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OUTBREAK), this.onCast);
  }

  private onCast(_event: CastEvent) {
    this._casts += 1;
  }

  get possibleCasts() {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    return Math.max(this._casts, Math.floor((fightMs - ONSET_MS) / OUTBREAK_CD_MS) + 1);
  }

  get castEfficiency() {
    return this.possibleCasts > 0 ? this._casts / this.possibleCasts : 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.castEfficiency,
      isLessThan: { minor: 1.0, average: 0.85, major: 0.7 },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._casts} of ${this.possibleCasts} possible Outbreak casts.`}
      >
        <BoringSpellValueText spell={SPELLS.OUTBREAK}>
          {this._casts} <small>/ {this.possibleCasts} possible</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default OutbreakTracker;
