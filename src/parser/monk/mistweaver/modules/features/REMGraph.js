import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  AreaSeries,
} from 'react-vis';
import { formatDuration } from 'common/format';
import HotTracker from '../core/HotTracker';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';


class REMGraph extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
  };

  tab() {
    return {
      title: 'Renewing Mists',
      url: 'RenewingMist',
      render: () => (
        <Panel
          title="Renewing Mists"
          explanation={(
            <>
              Shows how many <SpellLink id={SPELLS.RENEWING_MIST.id} /> you have out at any given point.
            </>
          )}
        >
        </Panel>
      ),
    };
  }
}

export default REMGraph;
