import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';

const BASE_DUR = 20; // The standard duration of IV

/*
 * Icy Veins' duration is increased by 10 sec.
 * Your Ice Lances against frozen targets extend your Icy Veins by an additional 1 sec.
 */
class ThermalVoid extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.THERMAL_VOID_TALENT.id);
  }

  statistic() {
    const hist = this.selectedCombatant.getBuffHistory(SPELLS.ICY_VEINS.id);
    if(!hist || hist.length === 0) {
      return null;
    }

    let totalIncrease = 0;
    let totalDuration = 0; // We could use getBuffUptime but we are doing the math anyway
    const castRows = hist.map((buff, idx) => {
      const end = buff.end || this.owner.currentTimestamp;
      const castTime = (buff.start - this.owner.fight.start_time) / 1000;
      const duration = (end - buff.start) / 1000;
      totalDuration += duration;
      // If the buff ended early because of death or fight end, don't blame the talent
      const increase = Math.max(0, duration - BASE_DUR);
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
      <TalentStatisticBox
        talent={SPELLS.THERMAL_VOID_TALENT.id}
        value={<><SpellIcon id={SPELLS.ICY_VEINS.id} /> +{formatNumber(totalIncrease)} seconds</>}
        tooltip="Extension times include the base 10 second increase from the talent."
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
            <tr key="avg">
              <th>Average</th>
              <th>{formatDuration(totalDuration / hist.length)}</th>
              <th>{formatDuration(totalIncrease / hist.length)}</th>
            </tr>
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default ThermalVoid;
