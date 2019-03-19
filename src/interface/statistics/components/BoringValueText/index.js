/**
 * A simple component that shows a value in the most plain way possible.
 * Use this only as the very last resort.
 */
import React from 'react';
import PropTypes from 'prop-types';


const BoringValue = ({ label, children, className }) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      {label}
    </label>
    <div className="value">
      {children}
    </div>
  </div>
);
BoringValue.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BoringValue;
