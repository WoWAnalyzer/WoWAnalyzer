import React from 'react';
import ITEMS from './ITEMS';
import ItemLink from './ItemLink';
import Icon from './Icon';

const ItemIcon = ({ id, ...others }) => (
  <ItemLink id={id}>
    <Icon
      icon={ITEMS[id].icon}
      alt={ITEMS[id].name}
      {...others}
    />
  </ItemLink>
);
ItemIcon.propTypes = {
  id: React.PropTypes.number.isRequired,
};

export default ItemIcon;
