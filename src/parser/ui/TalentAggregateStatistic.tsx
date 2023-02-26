import { formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon, SpellLink } from 'interface';
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

type Props = {
  bars: TalentAggregateBarSpec[];
  scaleFactor?: number;
  wide: boolean;
};

/**
 * A JSX element that creates and graphs a collection of data points based on the given input data
 * @param bars an array of type TalentAggregateBarSpec
 * @param scaleFactor optional param used to control the scale of the graph within the statistic box.
 * Can be set manually or calculated using the ratios of specs to total
 */
const TalentAggregateBars = ({ bars, scaleFactor, wide = true }: Props) => {
  return (
    <>
      {bars.map((spec) => (
        <div key={spec.spell.name} className="flex-main talent-aggregate-bar">
          <div className="flex main-bar">
            <div className="flex-sub bar-label">
              {getSpellLink(spec, wide)} <small>{formatNumber(getSpecSubtotal(spec))} </small>
            </div>
            <div className="flex-main chart">
              <TalentAggregateBar
                amount={spec.amount}
                percentTotal={getPercentContribution(spec.amount, bars)}
                barColor={spec.color}
                barTooltip={spec.tooltip}
                scaleFactor={scaleFactor}
                wide={wide}
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
};

/**
 * Function to get the sum of all amounts for parent and children TalentAggregateBarSpec
 * (Sum of TalentAggregateBarSpec.amount and all TalentAggregateBarSpec.subSpec[].amount)
 * @param spec the TalentAggregateBarSpec being iterated on
 * @returns the sum of all amount parameters for parent and children TalentAggregateBarSpec
 */
export function getSpecSubtotal(spec: TalentAggregateBarSpec) {
  return (
    spec.amount +
    (spec.subSpecs ? spec.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0) : 0)
  );
}

/**
 * Function to get the percentage contribution for an individual TalentAggregateBarSpec amount
 * relative to the total summed amount of all provided TalentAggregateBarSpecs
 * @param amount the amount property on a given TalentAggregateBarSpec
 * @param bars the input TalentAggregateBarSpec array
 * @returns   percentage contribution for an individual TalentAggregateBarSpec amount
 */
function getPercentContribution(amount: number, bars: TalentAggregateBarSpec[]) {
  const total = bars.reduce((sum, item) => sum + getSpecSubtotal(item), 0);
  return amount / total;
}

/**
 * @param spec TalentAggregateBarSpec
 * @returns the SpellLink component for the given spec's spell
 */
function getSpellLink(spec: TalentAggregateBarSpec, wide?: boolean) {
  return <>{wide ? <SpellLink id={spec.spell.id} /> : <SpellIcon id={spec.spell.id} />} </>;
}

export default TalentAggregateBars;
