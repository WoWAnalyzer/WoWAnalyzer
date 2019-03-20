/**
 * A simple component that shows the resource icon left and a value right.
 */
import React from 'react';
import PropTypes from 'prop-types';

import ResourceIcon from 'common/ResourceIcon';

import './BoringResourceValue.scss';

const BoringResourceValue = ({ resource, value, label, extra, className }) => (
  <div className={`flex boring-resource-value ${className || ''}`}>
    <div className="flex-sub icon">
      <ResourceIcon id={resource.id} />
    </div>
    <div className="flex-main value">
      <div>{value}</div>
      <small>{label}</small>
      {extra}
    </div>
  </div>
);
BoringResourceValue.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  value: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
  extra: PropTypes.node,
  className: PropTypes.string,
};

export default BoringResourceValue;
