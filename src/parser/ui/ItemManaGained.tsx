import React from 'react';
import PropTypes from 'prop-types';

import { formatThousands } from 'common/format';
import ManaIcon from 'interface/icons/Mana';
import CombatLogParser from 'parser/core/CombatLogParser';

interface Props {
  amount: number;
  approximate?: boolean;
}
interface Context {
  parser: CombatLogParser;
}

const ItemManaGained = (
  { amount, approximate }: Props,
  { parser }: Context,
) => (
  <>
    <ManaIcon /> {approximate && '≈'}
    {formatThousands((amount / parser.fightDuration) * 1000 * 5)} MP5{' '}
    <small>{formatThousands(amount)} total mana</small>
  </>
);
ItemManaGained.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemManaGained;
