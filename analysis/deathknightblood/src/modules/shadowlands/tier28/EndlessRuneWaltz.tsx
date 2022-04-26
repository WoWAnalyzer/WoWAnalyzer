import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class EndlessRuneWaltz extends Analyzer {
  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.has2Piece()) {
      this.active = false;
      return;
    }
  }

  get stackTimes() {
    return this.selectedCombatant.getStackBuffUptimes(SPELLS.ENDLESS_RUNE_WALTZ.id);
  }

  get avgStr() {
    return (
      Object.entries(this.stackTimes).reduce(
        (sum, [stacks, activeTime]) => sum + activeTime * Number(stacks),
        0,
      ) /
      this.owner.fightDuration /
      100.0
    );
  }

  get drwCasts() {
    const history = this.selectedCombatant.getBuffHistory(SPELLS.ENDLESS_RUNE_WALTZ.id);
    return history.map((buff) => [
      (buff.end || this.owner.fight.end_time) - buff.start,
      buff.stacks,
    ]);
  }

  get drwUptime() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.DANCING_RUNE_WEAPON_BUFF.id);
    return uptime / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={<>{formatPercentage(this.drwUptime)}% Dancing Rune Weapon Uptime</>}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>Time (s)</th>
                  <th>Max Stacks</th>
                </tr>
              </thead>
              <tbody>
                {this.drwCasts.map(([duration, stacks], idx) => (
                  <tr key={idx}>
                    <th>{idx + 1}</th>
                    <td>{formatDuration(duration)}</td>
                    <td>{stacks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ENDLESS_RUNE_WALTZ.id}>
          <>
            {formatPercentage(this.avgStr)} % <small>Average Strength</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EndlessRuneWaltz;
