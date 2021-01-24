import React from 'react';
import PropTypes from 'prop-types';

import { formatNumber, formatPercentage } from 'common/format';
import CombatLogParser from 'parser/core/CombatLogParser';

interface Props {
  amount: number;
  approximate?: boolean;
}
interface Context {
  parser: CombatLogParser;
}

const ItemDamageTaken = (
  { amount, approximate }: Props,
  { parser }: Context,
) => (
  <>
    <img src="/img/shield.png" alt="Damage Taken" className="icon" />{' '}
    {approximate && '≈'}
    {formatNumber((amount / parser.fightDuration) * 1000)} DTPS{' '}
    <small>
      {formatPercentage(parser.getPercentageOfTotalDamageTaken(amount))}% of
      total
    </small>
  </>
);
ItemDamageTaken.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemDamageTaken;
