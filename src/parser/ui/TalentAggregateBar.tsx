import { formatPercentage } from 'common/format';
import { Tooltip } from 'interface';
import * as React from 'react';
import { ReactNode } from 'react';
import './TalentAggregateBar.scss';
import { TalentAggregateBarSpec } from './TalentAggregateStatistic';

type Props = {
  amount: number;
  percentTotal: number;
  barColor?: string;
  barTooltip?: ReactNode | string;
  scaleFactor?: number;
  subSpecs?: TalentAggregateBarSpec[];
  subSpecPercents?: number[];
};

const TalentAggregateBar = ({
  amount,
  percentTotal,
  barColor,
  barTooltip,
  scaleFactor,
  subSpecs,
  subSpecPercents,
  ...others
}: Props) => {
  return (
    <div className="source-bar" {...others}>
      <Tooltip content={barTooltip ? barTooltip : percentTotal + '%'}>
        <div style={getSegment(percentTotal, barColor, scaleFactor)}><small><strong>{formatPercentage(percentTotal)}%</strong></small></div>
      </Tooltip>
      {subSpecs &&
        subSpecPercents &&
        subSpecs.map((subSpec, idx) => (
          <Tooltip
            key={subSpec.spell.name}
            content={
              subSpec.tooltip ? subSpec.tooltip : formatPercentage(subSpecPercents[idx]) + '%'
            }
          >
            <div style={getSegment(subSpecPercents[idx], subSpec.color, scaleFactor)}><small><strong>{formatPercentage(subSpecPercents[idx])}%</strong></small></div>
          </Tooltip>
        ))}
    </div>
  );
};

function getSegment(
  percentTotal: number,
  barColor: string | undefined,
  scaleFactor?: number,
): React.CSSProperties {
  return barColor !== undefined
    ? {
        //borderRadius: `2px`,
        left: `0%`,
        width: `${percentTotal * 100 * (scaleFactor ? scaleFactor : 1)}%`,
        background: `${barColor}`,
      }
    : {
        left: `0%`,
        width: `${percentTotal * 100 * (scaleFactor ? scaleFactor : 1)}%`,
      };
}

export default TalentAggregateBar;
