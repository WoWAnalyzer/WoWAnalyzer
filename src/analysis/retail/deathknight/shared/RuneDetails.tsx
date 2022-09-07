import { t } from '@lingui/macro';
import { Panel } from 'interface';
import Analyzer, { ParseResultsTab } from 'parser/core/Analyzer';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

import RuneBreakdown from './RuneBreakdown';
import RuneTracker from './RuneTracker';

class RuneDetails extends Analyzer {
  static dependencies = {
    runeTracker: RuneTracker,
  };

  protected runeTracker!: RuneTracker;

  tab(): ParseResultsTab {
    const data = this.runeTracker.runesReady;

    const spec: VisualizationSpec = {
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
          title: t({ id: 'deathknight.shared.runeDetails.numberOfRunes', message: '# of Runes' }),
          axis: {
            grid: false,
            tickMinStep: 1,
          },
        },
      },
    };

    return {
      title: t({ id: 'deathknight.shared.runeDetails.title', message: 'Rune usage' }),
      url: 'rune-usage',
      render: () => (
        <Panel>
          <AutoSizer disableHeight>
            {({ width }) => (
              <BaseChart width={width} height={400} spec={spec} data={{ runes: data }} />
            )}
          </AutoSizer>
          <RuneBreakdown tracker={this.runeTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default RuneDetails;
