import SPELLS from 'common/SPELLS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class ScourgeStrikeEfficiency extends Analyzer {
  private totalCasts = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SCOURGE_STRIKE),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.totalCasts += 1;
  }

  get castsPerMinute(): number {
    return this.totalCasts / (this.owner.fightDuration / 1000 / 60);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You cast Scourge Strike ${this.totalCasts} times.`}
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SCOURGE_STRIKE}>
          <>
            {this.totalCasts} <small>casts</small>
            <br />
            {this.castsPerMinute.toFixed(1)} <small>CPM</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScourgeStrikeEfficiency;
