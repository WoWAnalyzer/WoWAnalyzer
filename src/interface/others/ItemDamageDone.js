import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, formatPercentage } from 'common/format';

const ItemDamageDone = props => {
  const { amount, approximate } = props;
  const { parser } = this.context;

  return (
    <>
      <img
        src="/img/sword.png"
        alt="Damage"
        className="icon"
      />{' '}
      {approximate && '≈'}{formatNumber(amount / parser.fightDuration * 1000)} DPS <small>{formatPercentage(parser.getPercentageOfTotalDamageDone(amount))} % of total</small>
    </>
  );
};

ItemDamageDone.propTypes = {
  amount: PropTypes.number.isRequired,
  approximate: PropTypes.bool,
};

ItemDamageDone.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemDamageDone;
