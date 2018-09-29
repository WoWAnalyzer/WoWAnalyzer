import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';

// dependencies
import HolyWordSanctify from 'parser/priest/holy/modules/spells/HolyWord/HolyWordSanctify';
import HolyWordChastise from 'parser/priest/holy/modules/spells/HolyWord/HolyWordChastise';
import HolyWordSerenity from 'parser/priest/holy/modules/spells/HolyWord/HolyWordSerenity';

class HolyWordWastedAmounts extends Analyzer {
  static dependencies = {
    sanctify: HolyWordSanctify,
    serenity: HolyWordSerenity,
    chastise: HolyWordChastise,
  };

  statistic() {
    const percWastedVersusTotal = (this.serenity.holyWordWastedCooldown + this.sanctify.holyWordWastedCooldown) / (this.serenity.totalCooldownReduction + this.sanctify.totalCooldownReduction);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_WORDS.id} />}
        value={`${formatPercentage(percWastedVersusTotal)}%`}
        label="Wasted Holy Words reduction"
        tooltip={`
          ${formatNumber(this.serenity.holyWordWastedCooldown / 1000)}s wasted Serenity reduction (of ${formatNumber(this.serenity.totalCooldownReduction / 1000)}s total)<br/>
          ${formatNumber(this.sanctify.holyWordWastedCooldown / 1000)}s wasted Sanctify reduction (of ${formatNumber(this.sanctify.totalCooldownReduction / 1000)}s total)<br/>
        `}
        position={STATISTIC_ORDER.CORE(4)}
      />
    );
  }
}


export default HolyWordWastedAmounts;
