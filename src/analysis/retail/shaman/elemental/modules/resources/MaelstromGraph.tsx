//Based on Main/Mana.js and parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import { Panel } from 'interface';
import MaelstromTracker from './MaelstromTracker';
import ResourceGraph, { GraphData } from 'parser/shared/modules/ResourceGraph';
import { VisualizationSpec } from 'react-vega';
import { formatTime } from 'parser/ui/BaseChart';
import SpellMaelstromCost from '../core/SpellMaelstromCost';

const COLORS = {
  MAELSTROM_BORDER: 'rgba(0, 145, 255, 1)',
  WASTED_MAELSTROM_BORDER: 'rgba(255, 90, 160, 1)',
};

export default class MaelstromGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    maelstromTracker: MaelstromTracker,
    spellMaelstromCost: SpellMaelstromCost,
  };

  protected maelstromTracker!: MaelstromTracker;
  protected spellMaelstromCost!: SpellMaelstromCost;

  tracker() {
    return this.maelstromTracker;
  }

  get graphData() {
    const graphData: GraphData[] = [];
    const tracker = this.tracker();
    const scaleFactor = this.scaleFactor();
    tracker.resourceUpdates.forEach((u) => {
      graphData.push({
        timestamp: u.timestamp,
        maelstrom: u.current * scaleFactor,
        wasted: (u.changeWaste || 0) * scaleFactor,
      });
    });
    return { graphData };
  }

  get vegaSpec(): VisualizationSpec {
    return {
      data: {
        name: 'graphData',
      },
      transform: [
        {
          filter: 'isValid(datum.timestamp)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
        {
          // Tooltips cant have calculated fields, so we need to calculate this here.
          calculate: formatTime('datum.timestamp_shifted'),
          as: 'timestamp_humanized',
        },
      ],
      encoding: {
        x: {
          field: 'timestamp_shifted',
          type: 'quantitative' as const,
          axis: {
            labelExpr: formatTime('datum.value'),
            tickCount: 25,
            grid: false,
          },
          scale: {
            nice: false,
          },
          title: null,
        },
      },
      layer: [
        {
          layer: [
            // First layer always applies
            {
              mark: {
                type: 'line' as const,
                //stroke: COLORS.MAELSTROM_BORDER,
                //color: COLORS.MAELSTROM_FILL,
                interpolate: 'step-after' as const,
              },
            },
            // Makes a visual point if the "hover" signal defined further down is active for this point.
            { transform: [{ filter: { param: 'hover', empty: false } }], mark: 'point' },
          ],
          encoding: {
            y: {
              field: 'maelstrom',
              type: 'quantitative' as const,
              axis: {
                grid: true,
              },
            },
          },
        },
        {
          layer: [
            {
              // First layer always applies
              mark: {
                type: 'line' as const,
                color: COLORS.WASTED_MAELSTROM_BORDER,
                interpolate: 'step-before' as const,
              },
            },
            // Makes a visual point if the "hover" signal defined further down is active for this point.
            { transform: [{ filter: { param: 'hover', empty: false } }], mark: 'point' },
          ],
          encoding: {
            y: {
              field: 'wasted',
              type: 'quantitative' as const,
              axis: {
                grid: true,
              },
            },
          },
        },
        {
          // Define one vertical line (type=rule) per datapoint that is white.
          mark: {
            type: 'rule',
            color: 'white',
          },
          encoding: {
            opacity: {
              // If the "hover" signal is active, make the line slightly opaque, else invisible.
              condition: {
                value: 0.3,
                param: 'hover',
                empty: false,
              },
              value: 0,
            },
            tooltip: [
              { field: 'timestamp_humanized', type: 'nominal', title: 'Time' },
              { field: 'maelstrom', type: 'quantitative', title: 'Maelstrom' },
              { field: 'wasted', type: 'quantitative', title: 'Wasted Maelstrom' },
            ],
          },
          // Activate the "hover" signal on the closest datapoint to the mouse cursor.
          params: [
            {
              name: 'hover',
              select: {
                type: 'point',
                fields: ['timestamp_shifted'],
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
            },
          ],
        },
      ],
      config: {
        view: {},
      },
    };
  }

  tab() {
    return {
      title: 'Maelstrom Chart',
      url: 'maelstrom',
      render: () => <Panel style={{ padding: '15px 22px' }}>{this.plot}</Panel>,
    };
  }
}
