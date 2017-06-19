import React from 'react';
import PropTypes from 'prop-types';
import ITEMS from './ITEMS';
import ItemLink from './ItemLink';
import Icon from './Icon';

const ItemIcon = ({ id, details, ...others }) => (
  <ItemLink id={id} details={details}>
    <Icon
      icon={ITEMS[id].icon}
      alt={ITEMS[id].name}
      {...others}
    />
  </ItemLink>
);
ItemIcon.propTypes = {
  id: PropTypes.number.isRequired,
  details: PropTypes.object,
};

export default ItemIcon;
