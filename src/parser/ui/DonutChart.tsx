import { useMemo } from 'react';
import { VisualizationSpec } from 'react-vega';
import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import BaseChart from 'parser/ui/BaseChart';

import 'parser/ui/DonutChart.scss';

export interface Item {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  color: string;
  value: number;
  valuePercent?: boolean;
  spellId?: number;
  itemLevel?: number;
  valueTooltip?: React.ReactNode;
}

interface Props {
  items: Item[];
  chartSize?: number;
  innerRadiusFactor?: number;
}

const DonutChart = ({ items, chartSize = 90, innerRadiusFactor = 0.28 }: Props) => {
  const total = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);

  const data = useMemo(() => ({ items }), [items]);

  const spec = useMemo<VisualizationSpec>(() => {
    const innerRadius = chartSize * innerRadiusFactor;

    return {
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
  }, [items, chartSize, innerRadiusFactor]);

  return (
    <div className="donut-chart">
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

      <div className="chart">
        <BaseChart width={chartSize} height={chartSize} spec={spec} data={data} />
      </div>
    </div>
  );
};

export default DonutChart;
