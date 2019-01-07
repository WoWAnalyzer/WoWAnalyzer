import React from 'react';
import PropTypes from 'prop-types';

const Ring = ({ innerRef, size, color, style, ...others }) => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: size,
      height: size,
      border: `2px solid ${color}`,
      borderRadius: '50%',
      ...style,
    }}
    ref={innerRef}
    {...others}
  />
);
Ring.propTypes = {
  size: PropTypes.number.isRequired,
  color: PropTypes.string,
  style: PropTypes.object,
};
Ring.defaultProps = {
  color: '#9c9c9c',
};

export default Ring;
