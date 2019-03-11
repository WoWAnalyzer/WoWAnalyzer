import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';
import FuryTracker from './FuryTracker';

import WastedFuryIcon from '../../images/dh_wasted_fury.jpg';

const furyIcon = 'inv_helm_leather_raiddemonhuntermythic_r_01';

class FuryDetails extends Analyzer {
  static dependencies = {
    furyTracker: FuryTracker,
  };

  get wastedFuryPercent() {
    return this.furyTracker.wasted / (this.furyTracker.wasted + this.furyTracker.generated);
  }

  get suggestionThresholds() {
    if (this.selectedCombatant.hasTalent(SPELLS.BLIND_FURY_TALENT.id)) {
      return {
        actual: this.wastedFuryPercent,
        isGreaterThan: {
          minor: 0.06,
          average: 0.10,
          major: 0.14,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.wastedFuryPercent,
        isGreaterThan: {
          minor: 0.02,
          average: 0.05,
          major: 0.08,
        },
        style: 'percentage',
      };
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(`You wasted ${formatNumber(this.furyTracker.wasted)} Fury.`)
        .icon(furyIcon)
        .actual(`${formatPercentage(actual)}% Fury wasted`)
        .recommended(`<${formatPercentage(recommended)}% is recommended.`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(4)}
        icon={(
          <img
            src={WastedFuryIcon}
            alt="Wasted Fury"
          />
        )}
        value={formatNumber(this.furyTracker.wasted)}
        label="Fury Wasted"
        tooltip={`${formatPercentage(this.wastedFuryPercent)}% wasted`}
      />
    );
  }

  tab() {
    return {
      title: 'Fury Usage',
      url: 'fury-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.furyTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }
}

export default FuryDetails;
