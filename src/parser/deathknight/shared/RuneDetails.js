import React from 'react';
import { AutoSizer } from 'react-virtualized';

import Analyzer from 'parser/core/Analyzer';
import { Panel } from 'interface';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';

import RuneBreakdown from './RuneBreakdown';
import RuneTracker from './RuneTracker';


class RuneDetails extends Analyzer {
  static dependencies = {
    runeTracker: RuneTracker,
  };

  tab() {
    const data = this.runeTracker.runesReady;

    const spec = {
      data: {
        name: 'runes',
      },
      mark: {
        type: 'line',
        color: 'rgb(196, 31, 59)',
      },
      encoding: {
        x: {
          field: 'x',
          type: 'quantitative',
          axis: {
            labelExpr: formatTime('datum.value * 1000'),
            grid: false,
          },
          title: null,
        },
        y: {
          field: 'y',
          type: 'quantitative',
          title: '# of Runes',
          axis: {
            grid: false,
            tickMinStep: 1,
          },
        },
      },
    };

    return {
      title: 'Rune usage',
      url: 'rune-usage',
      render: () => (
        <Panel>
          <AutoSizer disableHeight>
            {({width}) => (
              <BaseChart
                width={width}
                height={400}
                spec={spec}
                data={{ runes: data }}
              />
            )}
          </AutoSizer>
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
