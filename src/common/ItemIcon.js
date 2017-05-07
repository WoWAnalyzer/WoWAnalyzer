import React from 'react';
import ITEMS from './ITEMS';
import ItemLink from './ItemLink';

const ItemIcon = ({ id }) => (
  <ItemLink id={id}>
    <img
      src={`./img/icons/${ITEMS[id].icon}.jpg`}
      alt={ITEMS[id].name}
    />
  </ItemLink>
);
ItemIcon.propTypes = {
  id: React.PropTypes.number.isRequired,
};

export default ItemIcon;
