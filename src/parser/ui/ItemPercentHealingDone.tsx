import { formatPercentage, formatNumber } from 'common/format';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';
import React from 'react';

interface Props {
  amount: number;
  approximate?: boolean;
  greaterThan?: boolean;
  lessThan?: boolean;
}
interface Context {
  parser: CombatLogParser;
}

/**
 * Like ItemHealingDone, but with the emphasis on the percentage over the HPS.
 */
const ItemPercentHealingDone = (
  { amount, approximate, greaterThan, lessThan }: Props,
  { parser }: Context,
) => (
  <>
    <img src="/img/healing.png" alt="Healing" className="icon" /> {approximate && '≈'}
    {greaterThan && '>'}
    {lessThan && '<'}
    {formatPercentage(parser.getPercentageOfTotalHealingDone(amount))} %{' '}
    <small>{formatNumber((amount / parser.fightDuration) * 1000)} HPS</small>
  </>
);
ItemPercentHealingDone.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemPercentHealingDone;
