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
 * Like ItemDamageDone, but with the emphasis on the percentage over the DPS.
 */
const ItemPercentDamageDone = (
  { amount, approximate, greaterThan, lessThan }: Props,
  { parser }: Context,
) => (
  <>
    <img src="/img/sword.png" alt="Damage" className="icon" /> {approximate && '≈'}
    {greaterThan && '>'}
    {lessThan && '<'}
    {formatPercentage(parser.getPercentageOfTotalDamageDone(amount))} %{' '}
    <small>{formatNumber((amount / parser.fightDuration) * 1000)} DPS</small>
  </>
);
ItemPercentDamageDone.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemPercentDamageDone;
