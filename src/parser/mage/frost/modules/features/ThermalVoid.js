import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatNumber } from 'common/format';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import CombatLogParser from 'parser/core/CombatLogParser';
import StatisticBox from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const BASE_DUR = 20; // The standard duration of IV

/*
 * Icy Veins' duration is increased by 10 sec.
 * Your Ice Lances against frozen targets extend your Icy Veins by an additional 1 sec.
 */
class ThermalVoid extends Analyzer {
  activeCast = null;
  casts = [];
  buffApplied = 0;
  extraUptime = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.THERMAL_VOID_TALENT.id);
  }

  onApplyIcyVeins(event) {
    // In the event that you get IV to refresh due to extended uptime. This maybe will only have ever happened in legion
    if (this.activeCast !== null) {
      this.activeCast.finish = event.timestamp;
    }
    this.activeCast = { start: event.timestamp, finish: null };
    this.casts.push(this.activeCast);
  }

  onRemoveIcyVeins(event) {
    this.casts.push({ start: event, finish: null });
    this.buffApplied = event.timestamp;
  }

  onFinish() {

  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ICY_VEINS.id) - this.extraUptime;
  }

  get averageDuration() {
    return this.uptime / this.casts;
  }

  get averageDurationSeconds() {
    return this.averageDuration / 1000;
  }

  statistic() {
    const hist = this.selectedCombatant.getBuffHistory(SPELLS.ICY_VEINS.id);
    let totalIncrease = 0;
    const castRows = hist.map((buff, idx) => {
      const end = buff.end || this.owner.currentTimestamp;
      const castTime = (buff.start - this.owner.fight.start_time) / 1000;
      const duration = (end - buff.start) / 1000;
      const increase = duration - BASE_DUR;
      totalIncrease += increase;
      return (
        <tr key={idx}>
          <td>{formatDuration(castTime)}</td>
          <td>{formatDuration(duration)}</td>
          <td>{formatDuration(increase)}</td>
        </tr>
      );
    });

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.THERMAL_VOID_TALENT.id} />}
        label={`<SpellLink id={SPELLS.THERMAL_VOID_TALENT.id} icon={false} /> average extension`}
        value={`${formatDuration(totalIncrease / hist.length)}`}
        tooltip="Icy Veins Casts that do not complete before the fight ends are removed from this statistic"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th>Duration</th>
              <th>Extension</th>
            </tr>
          </thead>
          <tbody>
            {castRows}
            <tr key="total">
              <th>Total</th>
              <th>--</th>
              <th>{formatDuration(totalIncrease)}</th>
            </tr>
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default ThermalVoid;
