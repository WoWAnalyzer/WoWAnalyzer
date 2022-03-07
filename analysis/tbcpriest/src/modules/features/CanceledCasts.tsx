import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';

class CanceledCasts extends Analyzer {
  canceledCasts: { [spellId: number]: number } = {};

  get TotalCanceledCastCount() {
    return Object.values(this.canceledCasts).reduce((a, b) => a + b);
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.onPlayerCast);
  }

  onPlayerCast(event: BeginCastEvent) {
    if (event.isCancelled) {
      this.canceledCasts[event.ability.guid] = this.canceledCasts[event.ability.guid] || 0;
      this.canceledCasts[event.ability.guid] += 1;
    }
  }

  get CanceledCastTable() {
    return Object.keys(this.canceledCasts).map((key) => (
      <tr key={`spell_${key}`}>
        <td>
          <SpellLink id={Number(key)} style={{ height: '2.4em' }} />
        </td>
        <td>{formatNumber(this.canceledCasts[Number(key)])}</td>
      </tr>
    ));
  }

  statistic() {
    return (
      <Statistic size="flexible">
        <div className="pad">
          <label>{this.TotalCanceledCastCount} total canceled casts</label>
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Spell</th>
                <th>Canceled Casts</th>
              </tr>
            </thead>
            <tbody>{this.CanceledCastTable}</tbody>
          </table>
        </div>
      </Statistic>
    );
  }
}

export default CanceledCasts;
