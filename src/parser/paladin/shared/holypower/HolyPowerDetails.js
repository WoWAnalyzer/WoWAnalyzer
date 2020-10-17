import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/statistics/Panel';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue';
import Statistic from 'interface/statistics/Statistic';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import HolyPowerTracker from './HolyPowerTracker';


const holyPowerIcon = 'inv_helmet_96';

class HolyPowerDetails extends Analyzer {
  static dependencies = {
    holyPowerTracker: HolyPowerTracker,
  };

  get wastedHolyPowerPercent() {
    return this.holyPowerTracker.wasted / (this.holyPowerTracker.wasted + this.holyPowerTracker.generated);
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedHolyPowerPercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.92,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(`You wasted ${formatNumber(this.holyPowerTracker.wasted)} Holy Power.`)
        .icon(holyPowerIcon)
        .actual(i18n._(t('paladin.shared.suggestions.holyPower.wasted')`${formatPercentage(this.wastedHolyPowerPercent)}% Holy Power wasted`))
        .recommended(`Wasting <${formatPercentage(1 - recommended)}% is recommended`));
  }

  statistic() {
    return [
      (
        <Statistic
          key="Statistic"
          size="small"
          position={STATISTIC_ORDER.CORE(4)}
          tooltip={`${formatPercentage(this.wastedHolyPowerPercent)}% wasted`}
        >
          <BoringResourceValue
            resource={RESOURCE_TYPES.HOLY_POWER}
            value={formatNumber(this.holyPowerTracker.wasted)}
            label="Holy Power Wasted"
          />
        </Statistic>
      ),
      (
        <Panel
          key="Panel"
          title="Holy power usage"
          pad={false}
        >
          <ResourceBreakdown
            tracker={this.holyPowerTracker}
            resourceName="Holy Power"
            showSpenders
          />
        </Panel>
      ),
    ];
  }
}

export default HolyPowerDetails;
