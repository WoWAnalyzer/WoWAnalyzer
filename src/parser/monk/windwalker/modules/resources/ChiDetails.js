// Heavily inspired by resource breakdown in Feral and Retribution
import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';
import ChiTracker from './ChiTracker';

import WastedChiIcon from '../../images/ability_monk_forcesphere.jpg';

class ChiDetails extends Analyzer {
  static dependencies = {
    chiTracker: ChiTracker,
  };

  get chiWasted() {
    return this.chiTracker.wasted;
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest('You are wasting Chi. Try to use it and not let it cap and go to waste')
        .icon('creatureportrait_bubble')
        .actual(`${this.chiWasted} Chi wasted (${actual} per minute)`)
        .recommended(`${recommended.toFixed(2)} Chi wasted is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(1)}
        icon={(
          <img
            src={WastedChiIcon}
            alt="Wasted Chi"
          />
        )}
        value={`${this.chiWasted}`}
        label="Wasted Chi"
      />
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
