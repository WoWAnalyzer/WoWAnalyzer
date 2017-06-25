import React from 'react';
import PropTypes from 'prop-types';
import ITEMS from './ITEMS';
import getItemQualityLabel from './getItemQualityLabel';

const ItemLink = ({ id, children, details, quality }) => {
  const queryString = [
    `item=${id}`,
  ];
  if (details) {
    if (details.gems && details.gems.length > 0) {
      queryString.push(`gems=${details.gems.map(gem => gem.id).join(':')}`);
    }
    if (details.permanentEnchant) {
      queryString.push(`ench=${details.permanentEnchant}`);
    }
    if (details.bonusIDs && details.bonusIDs.length > 0) {
      queryString.push(`bonus=${details.bonusIDs.join(':')}`);
    }
  }

  return (
    <a href={`http://www.wowhead.com/${queryString.join('&')}`} target="_blank" rel="noopener noreferrer" className={getItemQualityLabel(quality || ITEMS[id].quality)}>
      {children || ITEMS[id].name}
    </a>
  );
};
ItemLink.propTypes = {
  id: PropTypes.number.isRequired,
  children: PropTypes.node,
  details: PropTypes.object,
  quality: PropTypes.number,
};

export default ItemLink;
