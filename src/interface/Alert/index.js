import React from 'react';
import PropTypes from 'prop-types';

const Alert = props => {
  const { kind, children, className, ...others } = props;

  return (
    <div className={`alert alert-${kind} ${className || ''}`} {...others}>
      {children}
    </div>
  );
};

Alert.propTypes = {
  kind: PropTypes.oneOf(['danger', 'warning', 'info']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Alert;
