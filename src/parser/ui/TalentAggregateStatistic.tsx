import { formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import TalentAggregateBar from './TalentAggregateBar';
import './TalentAggregateStatistic.scss';

export type TalentAggregateBarSpec = {
  /** spell */
  spell: Spell;
  /** amount contributed by spell**/
  amount: number;
  /** Color to render the bar */
  color?: string;
  /* Content that will be displayed when mousing over the graph bar*/
  tooltip?: ReactNode | string;
  /* Secondary contribution from the same source - rendered to the same bar*/
  subSpecs?: TalentAggregateBarSpec[];
};

/**
 * A JSX element that creates and graphs a collection of data points based on the given input data
 * @param bars the object data to be turned into an item on the chart
 * @param scaleFactor optional param used to control the scale of the graph within the statistic box
 *
 */

export default function talentAggregateBars(
  bars: TalentAggregateBarSpec[],
  scaleFactor?: number,
): React.ReactNode {
  return (
    <>
      {bars.map((spec) => (
        <div key={spec.spell.name} className="flex-main multi-source-contribution-bar">
          <div className="flex main-bar">
            <div className="flex-sub bar-label">
              {getSpellLink(spec)}{' '}
              <small>
                {formatNumber(
                  spec.amount +
                    (spec.subSpecs
                      ? spec.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0)
                      : 0),
                )}
              </small>
            </div>
            <div className="flex-main chart">
              <TalentAggregateBar
                amount={spec.amount}
                percentTotal={getPercentContribution(spec.amount, bars)}
                barColor={spec.color}
                barTooltip={spec.tooltip}
                scaleFactor={scaleFactor}
                subSpecs={spec.subSpecs}
                subSpecPercents={spec.subSpecs?.map((subSpec) => {
                  return getPercentContribution(subSpec.amount || 0, bars);
                })}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function getPercentContribution(currentAmount: number, bars: TalentAggregateBarSpec[]) {
  const total = bars.reduce(
    (sum, item) =>
      sum +
      item.amount +
      (item.subSpecs
        ? item.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0)
        : 0),
    0,
  );
  return currentAmount / total;
}

function getSpellLink(spec: TalentAggregateBarSpec) {
  return (
    <>
      <SpellLink id={spec.spell.id} />{' '}
    </>
  );
}
