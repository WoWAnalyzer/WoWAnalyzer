import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Gauge from 'interface/statistics/components/Gauge';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots. Make good use of your <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} /> or <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id} /> when you can.</>)
          .icon('spell_mage_altertime')
          .actual(i18n._(t('warlock.affliction.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        tooltip={(
          <>
            Downtime is available time not used to cast anything (including not having your GCD rolling). This can be caused by delays between casting spells, latency, cast interrupting or just simply not casting anything (e.g. due to movement/stunned).<br />
            <ul>
              <li>You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your time casting something.</li>
              <li>You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time casting nothing at all.</li>
            </ul>
          </>
        )}
      >
        <div className="pad">
          <label>Active time</label>

          <Gauge value={this.activeTimePercentage} />
        </div>
      </Statistic>
    );
  }
}

export default AlwaysBeCasting;
