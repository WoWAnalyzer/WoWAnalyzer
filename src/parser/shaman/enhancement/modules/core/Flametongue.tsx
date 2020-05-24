import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import { Trans } from '@lingui/macro';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';

/**
 *
 */

class Flametongue extends Analyzer {

  get flametongueUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FLAMETONGUE_BUFF.id) / this.owner.fightDuration;
  }

  get flametongueRefreshTreshold() {
    return {
      actual: this.flametongueUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.flametongueRefreshTreshold)
      .addSuggestion(
        (suggest: any, actual: any, recommended: any) => {
          return suggest(
            <Trans>
              Your Flametongue uptime of {formatPercentage(this.flametongueUptime)}% is below 95%, try to get as close to 100% as possible
            </Trans>,
          )
            .icon(SPELLS.FLAMETONGUE_BUFF.icon)
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
        position={STATISTIC_ORDER.CORE(3)}
        size="small"
      >
        <BoringSpellValue
          spell={SPELLS.FLAMETONGUE}
          value={`${formatPercentage(this.flametongueUptime)} %`}
          label="Flametongue Uptime"
        />
      </Statistic>
    );
  }
}

export default Flametongue;
