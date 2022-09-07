import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import UnlimitedPowerTimesByStacks from './UnlimitedPowerTimesByStacks';

const HASTE_PER_STACK = 0.02;

class UnlimitedPower extends Analyzer {
  static dependencies = {
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
  };

  protected unlimitedPowerTimesByStacks!: UnlimitedPowerTimesByStacks;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLIMITED_POWER_TALENT.id);
  }

  get unlimitedPowerTimesByStack() {
    return this.unlimitedPowerTimesByStacks.unlimitedPowerTimesByStacks;
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.UNLIMITED_POWER_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get averageHaste() {
    return this.unlimitedPowerTimesByStacks.averageUnlimitedPowerStacks * HASTE_PER_STACK;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Time (s)</th>
                  <th>Time (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.unlimitedPowerTimesByStack).map((e, i) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0))}</td>
                    <td>
                      {formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.UNLIMITED_POWER_TALENT.id}>
          <>Unlimited Power Average Haste Gain (Uptime {formatPercentage(this.uptime)}%)</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UnlimitedPower;
