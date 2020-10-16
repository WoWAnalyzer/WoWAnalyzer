// Heavily inspired by resource breakdown in Feral and Retribution
import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import ChiTracker from 'parser/monk/windwalker/modules/resources/ChiTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue/index';
import { formatPercentage } from 'common/format';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class ChiDetails extends Analyzer {
  static dependencies = {
    chiTracker: ChiTracker,
  };

  get chiWasted() {
    return this.chiTracker.wasted;
  }

  get chiWastedPercent() {
    return this.chiWasted / (this.chiWasted + this.chiTracker.generated) || 0;
  }

  get chiWastedPerMinute() {
    return (this.chiWasted / this.owner.fightDuration) * 1000 * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.chiWastedPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest('You are wasting Chi. Try to use it and not let it cap and go to waste')
        .icon('creatureportrait_bubble')
        .actual(i18n._(t('monk.windwalker.suggestions.chi.wastedPerMinute')`${this.chiWasted} Chi wasted (${(actual.toFixed(2))} per minute)`))
        .recommended(`${recommended} Chi wasted is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="small"
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={<>{formatPercentage(this.chiWastedPercent)}% wasted</>}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.CHI}
          value={this.chiWasted}
          label="Wasted Chi"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Chi',
      url: 'chi',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.chiTracker}
            resourceName="Chi"
            showSpenders
          />
        </Panel>
      ),
    };
  }
}

export default ChiDetails;
