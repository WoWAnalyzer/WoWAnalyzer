import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import React from 'react';

class CanceledCasts extends Analyzer {
  canceledCasts: any = {};

  get TotalCanceledCastCount() {
    let total = 0;
    for (const spellId in this.canceledCasts) {
      total += this.canceledCasts[spellId];
    }
    return total;
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
    const rows = [];
    for (const spellId in this.canceledCasts) {
      rows.push(
        <tr>
          <td>
            <SpellLink id={Number(spellId)} style={{ height: '2.4em' }} />
          </td>
          <td>{formatNumber(this.canceledCasts[spellId])}</td>
        </tr>,
      );
    }
    return rows;
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
