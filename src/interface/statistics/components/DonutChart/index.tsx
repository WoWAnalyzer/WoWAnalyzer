import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import BaseChart from 'interface/others/BaseChart';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import { TooltipElement } from 'common/Tooltip';

import './style.scss';
import { VisualizationSpec } from 'react-vega';

export type DonutChartItem = {
  label: string | ReactNode;
  spellId?: number;
  value: number;
  color: string;
  valueTooltip?: ReactNode;
  tooltip?: ReactNode;
};

type DonutChartProps = {
  items: DonutChartItem[];
  /**
   * Strongly recommend not changing this to maintain consistency
   */
  chartSize?: number;
  innerRadiusFactor?: number;
};

class DonutChart extends React.PureComponent<DonutChartProps> {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.node.isRequired,
        color: PropTypes.string.isRequired,
        tooltip: PropTypes.node,
        spellId: PropTypes.number,
        valueTooltip: PropTypes.node,
      }),
    ).isRequired,
    // While you could change the chart size, I strongly recommend you do not for consistency and to avoid breaking whenever this component is modified. Do you really need to adjust the size?
    chartSize: PropTypes.number,
    innerRadiusFactor: PropTypes.number,
  };

  static defaultProps = {
    chartSize: 90,
    innerRadiusFactor: 0.28,
  };

  renderLegend(items: DonutChartItem[]) {
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="legend">
        {items.map(({ color, label, tooltip, value, spellId, valueTooltip }, index) => {
          label = tooltip ? <TooltipElement content={tooltip}>{label}</TooltipElement> : label;
          label = spellId ? <SpellLink id={spellId}>{label}</SpellLink> : label;
          return (
            <div key={index} className="flex">
              <div className="flex-sub">
                <div className="circle" style={{ background: color }} />
              </div>
              <div className="flex-main">{label}</div>
              <div className="flex-sub">
                <TooltipElement content={valueTooltip ? valueTooltip : value}>
                  {formatPercentage(value / total, 0)}%
                </TooltipElement>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  renderChart(items: DonutChartItem[], chartSize: number, innerRadiusFactor: number) {
    const innerRadius = chartSize * innerRadiusFactor;

    const data = {
      items,
    };
    const spec: VisualizationSpec = {
      data: {
        name: 'items',
      },
      mark: {
        type: 'arc',
        innerRadius,
      },
      encoding: {
        theta: {
          field: 'value',
          type: 'quantitative',
        },
        color: {
          field: 'label',
          type: 'nominal',
          legend: null,
          scale: {
            domain: items.map(({ label }: any) => label),
            range: items.map(({ color }) => color),
          },
        },
      },
      view: {
        stroke: null,
      },
    };
    return (
      <div className="chart">
        <BaseChart width={chartSize} height={chartSize} spec={spec} data={data} />
      </div>
    );
  }
  render() {
    const { items, chartSize, innerRadiusFactor }: any = this.props;

    return (
      <div className="donut-chart">
        {this.renderLegend(items)}
        {this.renderChart(items, chartSize, innerRadiusFactor)}
      </div>
    );
  }
}

export default DonutChart;
