import { t, Trans } from '@lingui/macro';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import BoneShieldTimesByStacks from './BoneShieldTimesByStacks';

class BoneShield extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };

  protected statTracker!: StatTracker;
  protected boneShieldTimesByStacks!: BoneShieldTimesByStacks;

  get boneShieldTimesByStack() {
    return this.boneShieldTimesByStacks.boneShieldTimesByStacks;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BONE_SHIELD.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.blood.boneShield.suggestion.suggestion">
          Your <SpellLink id={SPELLS.BONE_SHIELD.id} /> uptime can be improved. Try to keep it up at
          all times.
        </Trans>,
      )
        .icon(SPELLS.BONE_SHIELD.icon)
        .actual(
          t({
            id: 'deathknight.blood.boneShield.suggestion.actual',
            message: `${formatPercentage(actual)}% Bone Shield uptime`,
          }),
        )
        .recommended(
          t({
            id: 'shared.suggestion.recommended.moreThanPercent',
            message: `>${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <Trans id="deathknight.blood.boneShield.statistic.header">
                    <th>Stacks</th>
                    <th>Time (s)</th>
                    <th>Time (%)</th>
                  </Trans>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.boneShieldTimesByStack).map((times, stacks) => (
                  <tr key={stacks}>
                    <th>{stacks}</th>
                    <td>{formatDuration(times.reduce((a, b) => a + b, 0))}</td>
                    <td>
                      {formatPercentage(
                        times.reduce((a, b) => a + b, 0) / this.owner.fightDuration,
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.BONE_SHIELD.id}>
          <Trans id="deathknight.blood.boneShield.statistic">
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BoneShield;
