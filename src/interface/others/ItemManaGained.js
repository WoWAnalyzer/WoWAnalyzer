import React from 'react';
import PropTypes from 'prop-types';

import ManaIcon from 'interface/icons/Mana';
import { formatThousands } from 'common/format';

class ItemManaGained extends React.PureComponent {
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
        <ManaIcon />{' '}
        {approximate && '≈'}{formatThousands(amount / parser.fightDuration * 1000 * 5)} MP5 <small>{formatThousands(amount)} total mana</small>
      </>
    );
  }
}

export default ItemManaGained;
