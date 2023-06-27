import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/rogue';
import { SpellIcon, SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBox from 'parser/ui/StatisticBox';

import { ROLL_THE_BONES_BUFFS } from '../../constants';

class RollTheBonesBuffs extends Analyzer {
  /**
   * Percentage of the fight that Roll the Bones was active
   * In other words, at least one of the buffs was active
   */
  get totalPercentUptime(): number {
    return this.percentUptime(TALENTS.ROLL_THE_BONES_TALENT.id);
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.totalPercentUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  percentUptime(spellid: number) {
    return this.selectedCombatant.getBuffUptime(spellid) / this.owner.fightDuration;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={TALENTS.ROLL_THE_BONES_TALENT.id} /> uptime can be improved. Try to
          always have <SpellLink id={TALENTS.ROLL_THE_BONES_TALENT.id} /> active, even with a lower
          value roll.
        </>,
      )
        .icon(TALENTS.ROLL_THE_BONES_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Roll the Bones uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon id={TALENTS.ROLL_THE_BONES_TALENT.id} />}
        value={
          <>
            <UptimeIcon /> {formatPercentage(this.totalPercentUptime)}% <small>uptime</small>
            <br />
          </>
        }
        label={<SpellLink id={TALENTS.ROLL_THE_BONES_TALENT.id} icon={false} />}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Buff</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {ROLL_THE_BONES_BUFFS.map((e) => (
              <tr key={e.id}>
                <th>
                  <SpellLink id={e.id} />
                </th>
                <td>{`${formatPercentage(this.percentUptime(e.id))} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default RollTheBonesBuffs;
