import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import UptimeIcon from 'interface/icons/Uptime';
import StatisticBox from 'parser/ui/StatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { t } from '@lingui/macro';

import { ROLL_THE_BONES_BUFFS } from '../../constants';

class RollTheBonesBuffs extends Analyzer {
  /**
   * Percentage of the fight that Roll the Bones was active
   * In other words, at least one of the buffs was active
   */
  get totalPercentUptime() {
    return this.percentUptime(SPELLS.ROLL_THE_BONES.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.totalPercentUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  percentUptime(spellid) {
    return this.selectedCombatant.getBuffUptime(spellid) / this.owner.fightDuration;
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> uptime can be improved. Try to always have <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> active, even with a lower value roll.</>)
      .icon(SPELLS.ROLL_THE_BONES.icon)
      .actual(t({
      id: "rogue.outlaw.suggestions.rollTheBones.uptime",
      message: `${formatPercentage(actual)}% Roll the Bones uptime`
    }))
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon id={SPELLS.ROLL_THE_BONES.id} />}
        value={(
          <>
            <UptimeIcon /> {formatPercentage(this.totalPercentUptime)}% <small>uptime</small><br />
          </>
        )}
        label={<SpellLink id={SPELLS.ROLL_THE_BONES.id} icon={false} />}
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
                <th><SpellLink id={e.id} /></th>
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
