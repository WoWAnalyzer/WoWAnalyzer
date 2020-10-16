import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue/index';
import Statistic from 'interface/statistics/Statistic';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import FuryTracker from './FuryTracker';

const furyIcon = 'ability_demonhunter_eyebeam';

class FuryDetails extends Analyzer {
  static dependencies = {
    furyTracker: FuryTracker,
  };

  get wastedFuryPercent() {
    return this.furyTracker.wasted / (this.furyTracker.wasted + this.furyTracker.generated);
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedFuryPercent,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(`You wasted ${formatNumber(this.furyTracker.wasted)} Fury.`)
        .icon(furyIcon)
        .actual(i18n._(t('demonhunter.havoc.suggestions.fury.wasted')`${formatPercentage(actual)}% Fury wasted`))
        .recommended(`<${formatPercentage(recommended)}% is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        size="small"
        position={STATISTIC_ORDER.CORE(4)}
        tooltip={`${formatPercentage(this.wastedFuryPercent)}% wasted`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.FURY}
          value={formatNumber(this.furyTracker.wasted)}
          label="Fury Wasted"
        />
      </Statistic>
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
