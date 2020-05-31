import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

/**
 * Frostbrand now also enhances your weapon's damage,
 * causing each of your weapon attacks to also deal
 * (3.159% of Attack power)% Frost damage.
 *
 * Example Log:
 */
class Hailstorm extends Analyzer {
  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id);
  }

  get frostbrandUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FROSTBRAND.id) / this.owner.fightDuration;
  }

  get frostbrandUptimeThresholds() {
    return {
      actual: this.frostbrandUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.95,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.frostbrandUptimeThresholds).addSuggestion(
      (suggest: any, actual: any, recommended: any) => {
        return suggest(
          <Trans>
            Try to make sure the Frostbrand is always up, when it drops you should refresh it as soon as possible
          </Trans>,
        )
          .icon(SPELLS.FROSTBRAND.icon)
          .actual(
            <Trans>
              {formatPercentage(actual)}% uptime
            </Trans>,
          )
          .recommended(
            <Trans>
              {formatPercentage(recommended, 0)}% is recommended
            </Trans>,
          );
      },
    );
  }

  statistic() {
    return (
      <Statistic
        category="TALENTS"
        position={STATISTIC_ORDER.CORE(1)}
        size="small"
      >
        <BoringSpellValue
          spell={SPELLS.FROSTBRAND}
          value={`${formatPercentage(this.frostbrandUptime)} %`}
          label="Frostbrand Uptime"
        />
      </Statistic>
    );
  }
}

export default Hailstorm;
