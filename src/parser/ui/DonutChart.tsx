import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import BaseChart from 'parser/ui/BaseChart';
import { PureComponent } from 'react';
import { VisualizationSpec } from 'react-vega';

import 'parser/ui/DonutChart.scss';

export type Item = {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  color: string;
  value: number;
  valuePercent?: boolean;
  spellId?: number;
  itemLevel?: number;
  valueTooltip?: React.ReactNode;
};

type Props = {
  items: Item[];
  chartSize: number;
  innerRadiusFactor: number;
};

class DonutChart extends PureComponent<Props> {
  static defaultProps = {
    chartSize: 90,
    innerRadiusFactor: 0.28,
  };

  renderLegend(items: Item[]) {
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="legend">
        {items.map(
          (
            { color, label, tooltip, value, valuePercent = true, spellId, valueTooltip, itemLevel },
            index,
          ) => {
            label = tooltip ? <TooltipElement content={tooltip}>{label}</TooltipElement> : label;
            label = spellId ? (
              <SpellLink spell={spellId} ilvl={itemLevel}>
                {label}
              </SpellLink>
            ) : (
              label
            );
            return (
              <div key={index} className="flex">
                <div className="flex-sub">
                  <div className="circle" style={{ background: color }} />
                </div>
                <div className="flex-main">{label}</div>
                <div className="flex-sub">
                  {valuePercent ? (
                    <TooltipElement content={valueTooltip ? valueTooltip : value}>
                      {formatPercentage(value / total, 0)}%
                    </TooltipElement>
                  ) : (
                    <>{formatNumber(value)}</>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    );
  }
  renderChart(items: Item[], chartSize: number, innerRadiusFactor: number) {
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
          field: 'color',
          type: 'nominal',
          legend: null,
          scale: {
            domain: items.map(({ color }) => color),
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
    const { items, chartSize, innerRadiusFactor } = this.props;

    return (
      <div className="donut-chart">
        {this.renderLegend(items)}
        {this.renderChart(items, chartSize, innerRadiusFactor)}
      </div>
    );
  }
}

export default DonutChart;
