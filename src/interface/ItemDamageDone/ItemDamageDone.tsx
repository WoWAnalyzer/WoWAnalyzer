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

const ItemDamageDone = (
  { amount, approximate }: Props,
  { parser }: Context,
) => (
  <>
    <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
    {approximate && '≈'}
    {formatNumber((amount / parser.fightDuration) * 1000)} DPS{' '}
    <small>
      {formatPercentage(parser.getPercentageOfTotalDamageDone(amount))} % of
      total
    </small>
  </>
);
ItemDamageDone.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemDamageDone;
