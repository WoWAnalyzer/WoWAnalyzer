import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

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
      <Wrapper>
        <ResourceIcon id={RESOURCE_TYPES.MANA.id} />{' '}
        {approximate && '≈'}{parser.formatManaRestored(amount)}
      </Wrapper>
    );
  }
}

export default ItemManaGained;
