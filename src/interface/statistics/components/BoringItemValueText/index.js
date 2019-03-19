/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */
import React from 'react';
import PropTypes from 'prop-types';

import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';

const BoringItemValueText = ({ item, children, className }) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <ItemIcon id={item.id} /> <ItemLink id={item.id} icon={false} />
    </label>
    <div className="value">
      {children}
    </div>
  </div>
);
BoringItemValueText.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BoringItemValueText;
