import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, formatPercentage } from 'common/format';

const ItemDamageTaken = props => {
  const { amount, approximate } = props;
  const { parser } = this.context;

  return (
    <>
      <img
        src="/img/shield.png"
        alt="Damage Taken"
        className="icon"
      />{' '}
      {approximate && '≈'}{formatNumber(amount / parser.fightDuration * 1000)} DTPS <small>{formatPercentage(parser.getPercentageOfTotalDamageTaken(amount))}% of total</small>
    </>
  );
};

ItemDamageTaken.propTypes = {
  amount: PropTypes.number.isRequired,
  approximate: PropTypes.bool,
};

ItemDamageTaken.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemDamageTaken;
