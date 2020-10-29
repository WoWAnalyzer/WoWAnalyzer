import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'interface/statistics/Statistic';

import BoneShieldTimesByStacks from './BoneShieldTimesByStacks';

class BoneShield extends Analyzer {

  static dependencies = {
    statTracker: StatTracker,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };

  get boneShieldTimesByStack() {
    return this.boneShieldTimesByStacks.boneShieldTimesByStacks;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BONE_SHIELD.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest('Your Bone Shield uptime can be improved. Try to keep it up at all times.')
          .icon(SPELLS.BONE_SHIELD.icon)
          .actual(i18n._(t('deathknight.blood.suggestions.boneShield.uptime')`${formatPercentage(actual)}% Bone Shield uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        dropdown={(
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
                {Object.values(this.boneShieldTimesByStack).map((e, i) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                    <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BONE_SHIELD}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BoneShield;
