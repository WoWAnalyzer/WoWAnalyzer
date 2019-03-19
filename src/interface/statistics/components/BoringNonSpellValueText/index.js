/**
 * A simple component that shows a non spell label in the most plain way possible.
 * Use this only as the very last resort.
 */
import React from 'react';
import PropTypes from 'prop-types';


const BoringNonSpellValue = ({ label, children, className }) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      {label}
    </label>
    <div className="value">
      {children}
    </div>
  </div>
);
BoringNonSpellValue.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BoringNonSpellValue;
