import React from 'react';
import ITEMS from './ITEMS';

const ItemLink = ({ id, children }) => (
  <a href={`http://www.wowhead.com/item=${id}`} target="_blank" className={ITEMS[id].quality}>
    {children || ITEMS[id].name}
  </a>
);
ItemLink.propTypes = {
  id: React.PropTypes.number.isRequired,
  children: React.PropTypes.node,
};

export default ItemLink;
