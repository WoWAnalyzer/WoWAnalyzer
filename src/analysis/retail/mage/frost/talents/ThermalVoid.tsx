import { formatDuration, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { TrackedBuffEvent } from 'parser/core/Entity';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BASE_DURATION = 30_000;

/*
 * Icy Veins' duration is increased by 5 sec.
 * Your Ice Lances against frozen targets extend your Icy Veins by an additional 0.5 sec.
 * Your Glacial Spike against frozen targets extend your Icy Veins by an additional 1 sec.
 */
class ThermalVoid extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.THERMAL_VOID_TALENT);
  }

  statistic() {
    const hist = this.selectedCombatant.getBuffHistory(TALENTS.ICY_VEINS_TALENT.id);
    if (!hist || hist.length === 0) {
      return null;
    }

    let totalIncrease = 0;
    let totalDuration = 0; // We could use getBuffUptime but we are doing the math anyway
    const castRows = hist.map((buff: TrackedBuffEvent, idx: number) => {
      const end = buff.end || this.owner.currentTimestamp;
      const castTime = buff.start - this.owner.fight.start_time;
      const duration = end - buff.start;
      totalDuration += duration;
      // If the buff ended early because of death or fight end, don't blame the talent
      const increase = Math.max(0, duration - BASE_DURATION);
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
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip="Extension times include the base 5 second increase from the talent."
        dropdown={
          <>
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
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.THERMAL_VOID_TALENT}>
          <>
            <SpellIcon spell={TALENTS.ICY_VEINS_TALENT} /> +{formatNumber(totalIncrease / 1000)}{' '}
            seconds
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThermalVoid;
