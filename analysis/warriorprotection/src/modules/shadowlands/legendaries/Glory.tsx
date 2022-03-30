import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Glory extends Analyzer {
  castMap: Boost[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.GLORY);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONQUERORS_BANNER),
      this.onCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CONQUERORS_BANNER),
      this.buffChange,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CONQUERORS_BANNER),
      this.buffChange,
    );
    this.addEventListener(Events.fightend, this.buffChange);
  }

  onCast(event: CastEvent) {
    this.castMap.push({
      startTime: event.timestamp,
      endTime: -1,
      duration: -1,
    });
  }

  buffChange(event: RefreshBuffEvent | RemoveBuffEvent | FightEndEvent) {
    const boost = this.castMap[this.castMap.length - 1];
    boost.endTime = event.timestamp;
    boost.duration = boost.endTime - boost.startTime;
  }

  dropdown() {
    return (
      <>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast #</th>
              <th>Duration</th>
              <th>Extension</th>
            </tr>
          </thead>
          <tbody>
            {this.castMap.map((gloryBoost, index) => (
              <tr key={index}>
                <th scope="row">{index}</th>
                <td>{formatDuration(gloryBoost.duration)}</td>
                <td>{formatDuration(gloryBoost.duration - 15000)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  statistic() {
    let totalBoost = 0;
    this.castMap.forEach((e) => (totalBoost += e.duration - 15000));

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        dropdown={this.dropdown()}
      >
        <BoringSpellValueText spellId={SPELLS.GLORY.id}>
          {formatDuration(totalBoost)} <small>total extension</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Glory;

export interface Boost {
  startTime: number;
  endTime: number;
  duration: number;
}
