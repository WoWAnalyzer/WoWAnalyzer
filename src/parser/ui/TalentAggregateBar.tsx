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
  wide: boolean;
};

const TalentAggregateBar = ({
  amount,
  percentTotal,
  barColor,
  barTooltip,
  scaleFactor = 1,
  subSpecs,
  subSpecPercents,
  wide = true,
  ...others
}: Props) => {
  return (
    <div className="source-bar" {...others}>
      <Tooltip content={barTooltip || formatPercentage(percentTotal) + '%'}>
        <div style={getSegment(percentTotal, barColor, scaleFactor)}>
          {showLabel(percentTotal, scaleFactor, wide) && (
            <span>
              <strong>{formatPercentage(percentTotal, 1)}%</strong>
            </span>
          )}
        </div>
      </Tooltip>
      {subSpecs &&
        subSpecPercents &&
        subSpecs.map((subSpec, idx) => (
          <Tooltip
            key={subSpec.spell.name}
            content={subSpec.tooltip || formatPercentage(subSpecPercents[idx]) + '%'}
          >
            <div style={getSegment(subSpecPercents[idx], subSpec.color, scaleFactor)}>
              {showLabel(subSpecPercents[idx], scaleFactor, wide) && (
                <span>
                  <strong>{formatPercentage(subSpecPercents[idx], 1)}%</strong>
                </span>
              )}
            </div>
          </Tooltip>
        ))}
    </div>
  );
};

/**
 * Determines if the TalentAggregateBar being generated is large enough relative to the
 * scaleFactor provided to fit the Percent Label. Used to control the viewstate of the bar label
 * @param percentTotal percent width of the TalentAggregateBar being rendered
 * @param scaleFactor the provided scale factor the component uses to size the chart
 * @returns true or false
 */
function showLabel(percentTotal: number, scaleFactor: number, wide: boolean): boolean {
  return 1 / percentTotal / (wide ? 10 : 5) < (scaleFactor || 1);
}

/**
 * Function to get the CSS properties for the TalentAggregateBar being rendered based on provided parameters
 * @param percentTotal percent of the current TalentAggregateBarSpec amount relative to the Total amount. Used to determine the width of the TalentAggregateBar being rendered.
 * @param barColor optional parameter to set the color of the TalentAggregateBar
 * @param scaleFactor the provided scale factor the component uses to size the chart
 * @returns the CSS properties for the TalentAggregateBar being rendered
 */
function getSegment(
  percentTotal: number,
  barColor: string | undefined,
  scaleFactor: number,
): React.CSSProperties {
  return barColor !== undefined
    ? {
        //borderRadius: `2px`,
        left: `0%`,
        width: `${percentTotal * 100 * scaleFactor}%`,
        background: `${barColor}`,
      }
    : {
        left: `0%`,
        width: `${percentTotal * 100 * scaleFactor}%`,
      };
}

export default TalentAggregateBar;
