import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SOLAR_GRACE_INCREASE } from '../../../constants';
import { formatDuration, formatPercentage } from 'common/format';

class SolarGrace extends Analyzer {
  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOLAR_GRACE_TALENT);
  }

  get averageStacks() {
    const filteredUptimes = this.filteredUptime;

    const totalUptime = filteredUptimes.reduce((sum, [, uptime]) => sum + uptime, 0);

    const weightedUptime = filteredUptimes.reduce(
      (sum, [stack, uptime]) => sum + Number(stack) * uptime,
      0,
    );

    return totalUptime > 0 ? weightedUptime / totalUptime : 0;
  }

  get filteredUptime() {
    const stackBuffUptimes = this.selectedCombatant.getStackBuffUptimes(SPELLS.SOLAR_GRACE_BUFF.id);

    const filteredUptimes = Object.entries(stackBuffUptimes).filter(([stack]) => Number(stack) > 0);

    return filteredUptimes;
  }

  get averageHasteIncrease() {
    return (
      (this.selectedCombatant.getBuffUptime(SPELLS.SOLAR_GRACE_BUFF.id) /
        this.owner.fightDuration) *
      SOLAR_GRACE_INCREASE *
      this.averageStacks
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Average Stacks: {this.averageStacks.toFixed(2)}
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {this.filteredUptime.map(([_, uptime], index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDuration(uptime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SOLAR_GRACE_TALENT}>
          <img alt="" src="/img/wheelchair.png" className="icon" />{' '}
          {formatPercentage(this.averageHasteIncrease, 1)}% <small>average haste increase</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SolarGrace;
