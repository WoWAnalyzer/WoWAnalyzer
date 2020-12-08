import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';

/**
 * Scorches your target, dealing (14.742% of Attack power) Fire damage,
 * and enhances your weapons with fire for 16 sec, causing each weapon attack
 * to deal up to (0 * Attack power) Fire damage.
 *
 * Warcraft Log: https://www.warcraftlogs.com/reports/Yq7wP2WTX1DLjVd9#fight=3&type=damage-done&ability=193796
 */
class Flametongue extends Analyzer {

  get flametongueUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FLAMETONGUE_BUFF.id) / this.owner.fightDuration;
  }

  get flametongueUptimeThreshold() {
    return {
      actual: this.flametongueUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.flametongueUptimeThreshold)
      .addSuggestion(
        (suggest, actual, recommended) => suggest(
          <Trans id="shaman.enhancement.modules.core.flametongue.suggestion">
            Your Flametongue uptime of {formatPercentage(this.flametongueUptime)}% is below 95%, try to get as close to 100% as possible
          </Trans>,
        )
          .icon(SPELLS.FLAMETONGUE_BUFF.icon)
          .actual(
            <Trans id="shaman.enhancement.modules.core.flametongue.actual">
              {formatPercentage(actual)}% uptime
            </Trans>,
          )
          .recommended(
            <Trans id="shaman.enhancement.modules.core.flametongue.recommended">
              {formatPercentage(recommended, 0)}% is recommended
            </Trans>,
          ),
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
