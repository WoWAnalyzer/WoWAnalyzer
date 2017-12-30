import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

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
      <Wrapper>
        <img
          src="/img/sword.png"
          alt="Damage"
          className="icon"
        />{' '}
        {approximate && '≈'}{parser.formatItemDamageDone(amount)}
      </Wrapper>
    );
  }
}

export default ItemDamageDone;
