import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';
import uptimeBarSubStatistic from '../core/UptimeBarSubStatistic';

class MoonfireUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  }

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.MOONFIRE_FERAL.id) / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_FERAL.id);
  }

  get suggestionThresholds() {
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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> uptime can be improved. You should
          refresh the DoT once it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off. You may wish to consider switching talents to{' '}
          <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> which is simpler to use and provides more
          damage in most situations.
        </>,
      )
        .icon(SPELLS.MOONFIRE_FERAL.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.moonfire.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  // statistic() {
  //   const moonfireUptime =
  //     this.enemies.getBuffUptime(SPELLS.MOONFIRE_FERAL.id) / this.owner.fightDuration;
  //   return (
  //     <Statistic size="flexible" position={STATISTIC_ORDER.OPTIONAL(2)}>
  //       <BoringSpellValueText spell={SPELLS.MOONFIRE_BEAR}>
  //         <>
  //           <UptimeIcon /> {formatPercentage(moonfireUptime)} % <small>uptime</small>
  //         </>
  //       </BoringSpellValueText>
  //     </Statistic>
  //   );
  // }

  subStatistic() {
    return uptimeBarSubStatistic(SPELLS.MOONFIRE_FERAL.id, this.uptime, this.uptimeHistory);
  }
}

export default MoonfireUptime;
