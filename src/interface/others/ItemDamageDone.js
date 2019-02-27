import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, formatPercentage } from 'common/format';

class ItemDamageDone extends React.PureComponent {
  static propTypes = {
    amount: PropTypes.number.isRequired,
    approximate: PropTypes.bool,
  };
  static contextTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { amount, approximate } = this.props;
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
  }
}

export default ItemDamageDone;
