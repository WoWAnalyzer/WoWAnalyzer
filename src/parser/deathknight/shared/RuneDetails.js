import React from 'react';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  LineSeries,
} from 'react-vis';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import { formatDuration, formatNumber } from 'common/format';

import RuneBreakdown from './RuneBreakdown';
import RuneTracker from './RuneTracker';

import './RuneDetails.scss';

class RuneDetails extends Analyzer {
  static dependencies = {
    runeTracker: RuneTracker,
  };

  tab() {
    const data = this.runeTracker.runesReady;

    console.log(data)

    return {
      title: 'Rune usage',
      url: 'rune-usage',
      render: () => (
        <Panel>
          <XYPlot
            xDomain={[0, this.owner.fightDuration / 1000]}
            height={400}
            margin={{
              top: 30,
            }}
          >
            <DiscreteColorLegend
              items={[
                { title: 'Runes', color: 'rgb(196, 31, 59)' },
              ]}
              orientation="horizontal"
            />
            <XAxis tickFormat={value => formatDuration(value, 0)} style={{ fill: 'white' }} />
            <YAxis tickValues={[0, 1, 2, 3, 4, 5, 6]} tickFormat={value => formatNumber(value)} style={{ fill: 'white' }} />
            <LineSeries
              data={data}
              color="rgb(196, 31, 59)"
              strokeWidth={2}
            />
          </XYPlot>
          <RuneBreakdown
            tracker={this.runeTracker}
            showSpenders
          />
        </Panel>
      ),
    };
 }

}

export default RuneDetails;
