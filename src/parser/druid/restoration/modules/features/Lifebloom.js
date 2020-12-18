import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'interface/statistics/Statistic';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import SpellIcon from 'common/SpellIcon';
import BoringValue from 'interface/statistics/components/BoringValueText';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { t } from '@lingui/macro';

class Lifebloom extends Analyzer {
  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  // "The Dark Titan's Advice" legendary buffs Lifebloom, making high uptime more important
  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.80,
        average: 0.60,
        major: 0.40,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    combatants: Combatants,
  };

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime can be improved. {this.hasDta ? <>High uptime is particularly important for taking advantage of your equipped <ItemLink id={ITEMS.THE_DARK_TITANS_ADVICE.id} /></> : ''}</>)
        .icon(SPELLS.LIFEBLOOM_HOT_HEAL.icon)
        .actual(t({
      id: "druid.restoration.suggestions.lifebloom.uptime",
      message: `${formatPercentage(this.uptimePercent)}% uptime`
    }))
        .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> Lifebloom Uptime</>}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptimePercent)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Lifebloom;
