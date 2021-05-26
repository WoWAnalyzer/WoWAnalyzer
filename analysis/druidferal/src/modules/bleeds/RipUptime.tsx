import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';

import Snapshots2, { BLOODTALONS_SPEC, TIGERS_FURY_SPEC } from '../core/Snapshots2';

class RipUptime extends Snapshots2 {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(options: Options) {
    super(SPELLS.RIP, SPELLS.RIP, [TIGERS_FURY_SPEC, BLOODTALONS_SPEC], options);
  }

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.RIP.id) / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RIP.id);
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.RIP.id} /> uptime can be improved. You can refresh the DoT once
          it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off.
          {!this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id) ? (
            <>
              {' '}
              Avoid spending combo points on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if{' '}
              <SpellLink id={SPELLS.RIP.id} /> will need refreshing soon.
            </>
          ) : (
            <></>
          )}
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.rip.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.RIP],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default RipUptime;
