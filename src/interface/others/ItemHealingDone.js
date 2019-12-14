import React from 'react';
import PropTypes from 'prop-types';
import { formatPercentage, formatNumber } from 'common/format';

const ItemHealingDone = props => {
  const { amount, approximate, greaterThan } = props;
  const { parser } = this.context;

  return (
    <>
      <img
        src="/img/healing.png"
        alt="Healing"
        className="icon"
      />{' '}
      {approximate && '≈'}
      {greaterThan && '>'}{formatNumber(amount / parser.fightDuration * 1000)} HPS <small>{formatPercentage(parser.getPercentageOfTotalHealingDone(amount))}% of total</small>
    </>
  );
};

ItemHealingDone.propTypes = {
  amount: PropTypes.number.isRequired,
  approximate: PropTypes.bool,
  greaterThan: PropTypes.bool,
};

ItemHealingDone.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemHealingDone;
