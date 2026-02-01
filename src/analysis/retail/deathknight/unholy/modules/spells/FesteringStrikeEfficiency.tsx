import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class FesteringStrikeEfficiency extends Analyzer {
  private totalCasts = 0;
  private totalFesteringScytheCasts = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_STRIKE),
      this.onFesteringStrikeCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_SCYTHE),
      this.onFesteringScytheCast,
    );
  }

  onFesteringStrikeCast(event: CastEvent) {
    this.totalCasts += 1;
  }

  onFesteringScytheCast(event: CastEvent) {
    this.totalFesteringScytheCasts += 1;
    this.totalCasts += 1;
  }

  get castsPerMinute(): number {
    return this.totalCasts / (this.owner.fightDuration / 1000 / 60);
  }

  get scythePercentage(): number {
    if (this.totalCasts === 0) {
      return 0;
    }
    return this.totalFesteringScytheCasts / this.totalCasts;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You cast Festering Strike ${this.totalCasts - this.totalFesteringScytheCasts} times and Festering Scythe ${this.totalFesteringScytheCasts} times.`}
        position={STATISTIC_ORDER.CORE(4)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FESTERING_STRIKE}>
          <>
            {this.totalCasts} <small>casts</small>
            <br />
            {this.castsPerMinute.toFixed(1)} <small>CPM</small>
            {this.totalFesteringScytheCasts > 0 && (
              <>
                <br />
                {formatPercentage(this.scythePercentage)}% <small>as Scythe</small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FesteringStrikeEfficiency;
