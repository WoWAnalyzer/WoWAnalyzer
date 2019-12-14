import React from 'react';
import PropTypes from 'prop-types';

import ManaIcon from 'interface/icons/Mana';
import { formatThousands } from 'common/format';

const ItemManaGained = props => {
  const { amount, approximate } = props;
  const { parser } = this.context;

  return (
    <>
      <ManaIcon />{' '}
      {approximate && '≈'}{formatThousands(amount / parser.fightDuration * 1000 * 5)} MP5 <small>{formatThousands(amount)} total mana</small>
    </>
  );
};

ItemManaGained.propTypes = {
  amount: PropTypes.number.isRequired,
  approximate: PropTypes.bool,
};

ItemManaGained.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemManaGained;
