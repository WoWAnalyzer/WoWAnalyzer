import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/rogue';
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
    return this.percentUptime(SPELLS.ROLL_THE_BONES.id);
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
          Your <SpellLink spell={SPELLS.ROLL_THE_BONES} /> uptime can be improved. Try to always
          have <SpellLink spell={SPELLS.ROLL_THE_BONES} /> active, even with a lower value roll.
        </>,
      )
        .icon(SPELLS.ROLL_THE_BONES.icon)
        .actual(
          defineMessage({
            id: 'rogue.outlaw.suggestions.rollTheBones.uptime',
            message: `${formatPercentage(actual)}% Roll the Bones uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon spell={SPELLS.ROLL_THE_BONES} />}
        value={
          <>
            <UptimeIcon /> {formatPercentage(this.totalPercentUptime)}% <small>uptime</small>
            <br />
          </>
        }
        label={<SpellLink spell={SPELLS.ROLL_THE_BONES} icon={false} />}
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
                  <SpellLink spell={e} />
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
