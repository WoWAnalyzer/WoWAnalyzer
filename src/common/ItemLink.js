import React from 'react';
import PropTypes from 'prop-types';
import ITEMS from './ITEMS';

const ItemLink = ({ id, children }) => (
  <a href={`http://www.wowhead.com/item=${id}`} target="_blank" rel="noopener noreferrer" className={ITEMS[id].quality}>
    {children || ITEMS[id].name}
  </a>
);
ItemLink.propTypes = {
  id: PropTypes.number.isRequired,
  children: PropTypes.node,
};

export default ItemLink;
