import { defineMessage } from '@lingui/macro';
import { Panel } from 'interface';
import Analyzer, { ParseResultsTab } from 'parser/core/Analyzer';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { i18n } from '@lingui/core';

import RuneBreakdown from './RuneBreakdown';
import RuneTracker from './RuneTracker';

class RuneDetails extends Analyzer {
  static dependencies = {
    runeTracker: RuneTracker,
  };

  protected runeTracker!: RuneTracker;

  get runeChart() {
    const data = this.runeTracker.runesReady;

    const spec: VisualizationSpec = {
      data: {
        name: 'runes',
      },
      mark: {
        type: 'line',
        interpolate: 'step',
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
          title: i18n._(
            defineMessage({
              id: 'deathknight.shared.runeDetails.numberOfRunes',
              message: '# of Runes',
            }),
          ),
          axis: {
            grid: false,
            tickMinStep: 1,
          },
        },
      },
    };

    return (
      <AutoSizer disableHeight>
        {({ width }) => <BaseChart width={width} height={400} spec={spec} data={{ runes: data }} />}
      </AutoSizer>
    );
  }

  tab(): ParseResultsTab {
    return {
      title: defineMessage({ id: 'deathknight.shared.runeDetails.title', message: 'Rune usage' }),
      url: 'rune-usage',
      render: () => (
        <Panel>
          {this.runeChart}
          <RuneBreakdown tracker={this.runeTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default RuneDetails;
